const router = require("express").Router();
const controller = require("../controllers/slot.controller");
const auth = require("../middleware/auth.middleware");

// Provider / Admin own slots
router.get(
  "/my",
  auth.verifyToken,
  auth.authorizeRoles(["PROVIDER", "ADMIN"]),
  controller.getMySlots
);

// Create slot
router.post("/", auth.verifyToken, controller.createSlots);

// Update, delete, toggle
router.put("/:id", auth.verifyToken, controller.updateSlot);
router.delete("/:id", auth.verifyToken, controller.deleteSlot);
router.put("/:id/toggle", auth.verifyToken, controller.toggleSlot);

// Admin: get all slots
router.get(
  "/all",
  auth.verifyToken,
  auth.authorizeRoles(["ADMIN"]),
  controller.getAllSlots
);

// Get slots by provider
router.get(
  "/provider/:providerId",
  controller.getSlots
);

module.exports = router;
