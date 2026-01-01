const Slot = require("../models/Slot.model");
const User = require("../models/User.model");

exports.createSlots = async (req, res, next) => {
  try {
    const { startTime, endTime, duration } = req.body;
    const providerId = req.user.id;

    if (!startTime || !endTime || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (start >= end) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    if (duration < 5 || duration > 180) {
      return res.status(400).json({ message: "Invalid slot duration" });
    }

    // overlap check
    const overlap = await Slot.findOne({
      providerId,
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (overlap) {
      return res.status(409).json({ message: "Slots overlap with existing ones" });
    }

    const slots = [];
    let cursor = new Date(start);

    while (cursor < end) {
      const slotEnd = new Date(cursor.getTime() + duration * 60000);
      if (slotEnd > end) break;

      slots.push({
        providerId,
        startTime: cursor,
        endTime: slotEnd
      });

      cursor = slotEnd;
    }

    if (!slots.length) {
      return res.status(400).json({ message: "No slots created" });
    }

    await Slot.insertMany(slots);

    res.status(201).json({
      message: "Slots created successfully",
      count: slots.length
    });
  } catch (err) {
    next(err);
  }
};

//get slots
exports.getSlots = async (req, res) => {
  const slots = await Slot.find({
    providerId: req.params.providerId,
    status: "AVAILABLE",
  }).sort({ startTime: 1 });

  // Map slots for frontend
  const formatted = slots.map((s) => ({
    _id: s._id,
    time: s.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: s.status
  }));

  res.json(formatted);
};

exports.getMySlots = async (req, res) => {
  const slots = await Slot.find({ providerId: req.user.id }).sort({ startTime: 1 });

  res.json(slots);
};


exports.deleteSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findOne({
      _id: req.params.id,
      providerId: req.user.id,
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.status === "BOOKED") {
      return res.status(400).json({ message: "Booked slot cannot be deleted" });
    }

    await slot.deleteOne();
    res.json({ message: "Slot deleted" });
  } catch (err) {
    next(err);
  }
};


exports.updateSlot = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    const providerId = req.user.id;
    const slotId = req.params.id;

    const slot = await Slot.findOne({ _id: slotId, providerId });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.status === "BOOKED") {
      return res.status(400).json({ message: "Booked slot cannot be modified" });
    }

    const newStart = new Date(startTime);
    const newEnd = new Date(endTime);

    if (newStart >= newEnd) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // Overlap check (exclude self)
    const overlap = await Slot.findOne({
      providerId,
      _id: { $ne: slotId },
      startTime: { $lt: newEnd },
      endTime: { $gt: newStart },
    });

    if (overlap) {
      return res.status(409).json({ message: "Slot overlaps with another slot" });
    }

    slot.startTime = newStart;
    slot.endTime = newEnd;
    slot.status = "AVAILABLE";

    await slot.save();

    res.json({ message: "Slot updated", slot });
  } catch (err) {
    next(err);
  }
};

exports.toggleSlot = async (req, res, next) => {
  try {
    const slot = await Slot.findOne({
      _id: req.params.id,
      providerId: req.user.id,
    });

    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.status === "BOOKED")
      return res.status(400).json({ message: "Booked slot cannot be changed" });

    slot.status = slot.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED";
    await slot.save();

    res.json({ message: "Slot updated", status: slot.status });
  } catch (err) {
    next(err);
  }
};

exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find()
      .populate({
        path: "providerId",
        select: "name email specialization",
        model: "User"
      });

    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all slots" });
  }
};
