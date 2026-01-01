const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Provider", ProviderSchema);
