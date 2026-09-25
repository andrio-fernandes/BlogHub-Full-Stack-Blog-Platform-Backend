const express = require("express");
const {
  getUsers,
  deleteBlog,
  deleteComment,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Every admin route requires a logged-in admin (protect then adminOnly).
router.use(protect, adminOnly);

router.get("/users", getUsers);
router.delete("/blogs/:id", deleteBlog);
router.delete("/comments/:id", deleteComment);

module.exports = router;