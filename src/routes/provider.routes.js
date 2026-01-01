const express = require("express");
const router = express.Router();
const providerController = require("../controllers/provider.controller");
const auth = require("../middleware/auth.middleware");

// PUBLIC
router.get("/", providerController.getProviders);
router.get("/withslots", providerController.getProvidersWithSlots);
router.get("/:id", providerController.getProvider);

// ADMIN ONLY
router.post(
  "/",
  auth.verifyToken,
  auth.authorizeRoles(["ADMIN"]),
  providerController.createProvider
);

router.put(
  "/:id",
  auth.verifyToken,
  auth.authorizeRoles(["ADMIN"]),
  providerController.updateProvider
);

router.delete(
  "/:id",
  auth.verifyToken,
  auth.authorizeRoles(["ADMIN"]),
  providerController.deleteProvider
);

module.exports = router;
