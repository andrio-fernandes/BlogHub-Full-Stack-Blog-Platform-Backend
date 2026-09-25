const express = require("express");
const {
  getBlogs,
  getMyBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");
const { getComments, addComment } = require("../controllers/commentController");

const router = express.Router();

// Order matters: /my must be declared BEFORE /:id,
// otherwise "my" would be treated as an id.
router.get("/my", protect, getMyBlogs); // my blogs (private)

router.route("/").get(getBlogs).post(protect, createBlog); // public read, private write

router.route("/:id").get(getBlogById).put(protect, updateBlog).delete(protect, deleteBlog);

// Nested: comments that belong to one blog (param name: blogId).
router.route("/:blogId/comments").get(getComments).post(protect, addComment);

module.exports = router;