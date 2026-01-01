const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["AVAILABLE", "BOOKED", "BLOCKED"],
    default: "AVAILABLE"
  },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }
});

SlotSchema.index({ providerId: 1, startTime: 1 });

module.exports = mongoose.model("Slot", SlotSchema);
