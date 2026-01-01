const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  providerId: mongoose.Schema.Types.ObjectId,
  slotId: mongoose.Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ["BOOKED", "CANCELLED", "RESCHEDULED"],
    default: "BOOKED"
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);
