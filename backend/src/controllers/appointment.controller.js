const mongoose = require("mongoose");
const Slot = require("../models/Slot.model");
const Appointment = require("../models/Appointment.model");

//book appointment
exports.bookAppointment = async (req, res, next) => {
  try {
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: "slotId is required" });
    }

    // User already booked this slot
    const existing = await Appointment.findOne({
      userId: req.user.id,
      slotId,
      status: "BOOKED"
    });

    if (existing) {
      return res.status(409).json({
        message: "You have already booked this slot"
      });
    }

    // Atomically book slot (blocks others)
    const slot = await Slot.findOneAndUpdate(
      { _id: slotId, status: "AVAILABLE" },
      { status: "BOOKED" },
      { new: true }
    );

    if (!slot) {
      return res.status(409).json({
        message: "Slot already booked by another user"
      });
    }

    //  Create appointment
    const appointment = await Appointment.create({
      userId: req.user.id,
      providerId: slot.providerId,
      slotId: slot._id,
      status: "BOOKED"
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

//cancel appointment
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const slot = await Slot.findById(appointment.slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const diff = slot.startTime.getTime() - Date.now();
    if (diff < 30 * 60 * 1000) {
      return res.status(400).json({ message: "Cancellation window closed" });
    }

    appointment.status = "CANCELLED";
    await appointment.save();

    slot.status = "AVAILABLE";
    slot.appointmentId = null;
    await slot.save();

    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    next(err);
  }
};

//reschedule appointment
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { newSlotId } = req.body;

    if (!newSlotId) {
      return res.status(400).json({ message: "newSlotId is required" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user.id // only owner can reschedule
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Lock new slot
    const newSlot = await Slot.findOneAndUpdate(
      { _id: newSlotId, status: "AVAILABLE" },
      { status: "BOOKED" },
      { new: true }
    );

    if (!newSlot) {
      return res.status(409).json({ message: "New slot unavailable" });
    }

    // Release old slot
    await Slot.findByIdAndUpdate(appointment.slotId, {
      status: "AVAILABLE"
    });

    appointment.slotId = newSlot._id;
    appointment.status = "RESCHEDULED";
    await appointment.save();

    res.json({ message: "Rescheduled successfully" });
  } catch (err) {
    next(err);
  }
};

//get apointment details
exports.getHistory = async (req, res) => {
  const history = await Appointment.find({ userId: req.user.id })
    .sort({ createdAt: -1 });
  res.json(history);
};
