const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (no token needed):
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private route: protect runs BEFORE getProfile and attaches req.user.
router.get("/profile", protect, getProfile);

module.exports = router;