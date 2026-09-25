const express = require("express");
const { deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Deleting a comment by id lives here (create/list live on the blog routes).
router.delete("/:id", protect, deleteComment);

module.exports = router;