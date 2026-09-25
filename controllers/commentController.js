const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");

// @desc    Get all comments for a blog (oldest first)
// @route   GET /api/blogs/:blogId/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const blogExists = await Blog.exists({ _id: blogId });
    if (!blogExists) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const comments = await Comment.find({ blog: blogId })
      .populate("user", "name email") // show who wrote each comment
      .sort({ createdAt: 1 });        // oldest first

    res.json({ success: true, count: comments.length, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add a comment to a blog
// @route   POST /api/blogs/:blogId/comments
// @access  Private (must be logged in)
const addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { text } = req.body;

    // Reject empty or overly long comments before touching the database.
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }
    if (text.trim().length > 1000) {
      return res.status(400).json({ success: false, message: "Comment must be 1000 characters or fewer" });
    }

    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const blogExists = await Blog.exists({ _id: blogId });
    if (!blogExists) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const comment = await Comment.create({
      blog: blogId,
      user: req.user._id, // from the protect middleware
      text: text.trim(),
    });

    // Load the user's name so the frontend can render it right away.
    await comment.populate("user", "name email");

    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a comment (author only)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // AUTHORIZATION CHECK — only the comment's writer may delete it.
    if (String(comment.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete comments you wrote",
      });
    }

    await Comment.deleteOne({ _id: comment._id });

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getComments, addComment, deleteComment };