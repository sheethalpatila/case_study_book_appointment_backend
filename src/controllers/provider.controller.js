const User = require("../models/User.model");
const Slot = require("../models/Slot.model");
const bcrypt = require("bcryptjs");

// GET ALL PROVIDERS
exports.getProviders = async (req, res) => {
  try {
    const providers = await User.find({
      role: "PROVIDER",
    }).select(
      "_id name email specialization experienceYears consultationFee isActive"
    );

    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch providers" });
  }
};

// GET SINGLE PROVIDER
exports.getProvider = async (req, res) => {
  try {
    const provider = await User.findOne({
      _id: req.params.id,
      role: "PROVIDER",
    }).select("-password");

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider" });
  }
};

// CREATE PROVIDER (ADMIN)
exports.createProvider = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;

    // Validation
    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        error: "Name, email, password and specialization are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const provider = await User.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      role: "PROVIDER",
    });

    res.status(201).json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create provider" });
  }
};

exports.updateProvider = async (req, res) => {
  try {
    const { specialization, experienceYears, consultationFee, isActive } = req.body;

    const provider = await User.findOneAndUpdate(
      { _id: req.params.id, role: "PROVIDER" },
      {
        ...(specialization !== undefined && { specialization }),
        ...(experienceYears !== undefined && { experienceYears }),
        ...(consultationFee !== undefined && { consultationFee }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    ).select("-password");

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: "Failed to update provider" });
  }
};

// SOFT DELETE PROVIDER
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await User.findOneAndUpdate(
      { _id: req.params.id, role: "PROVIDER", isDeleted: false },
      {
        isDeleted: true,
        isActive: false,
      },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.json({ message: "Provider deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete provider" });
  }
};


exports.getProvidersWithSlots = async (req, res) => {
  try {
    // Get providerIds that have available slots
    const providerIds = await Slot.distinct("providerId", {
      status: "AVAILABLE", // use status instead of isBooked
    });

    const providers = await User.find({
      _id: { $in: providerIds },
      role: "PROVIDER",
      isActive: true,
      isDeleted: false, // IMPORTANT
    }).select("_id name specialization");

    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: "Failed to load providers with slots" });
  }
};

