const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/appointment.controller");

// Use named function for JWT middleware
router.post("/", auth.verifyToken, controller.bookAppointment);
router.delete("/:id", auth.verifyToken, controller.cancelAppointment);
router.put("/:id/reschedule", auth.verifyToken, controller.rescheduleAppointment);
router.get("/history", auth.verifyToken, controller.getHistory);

module.exports = router;
