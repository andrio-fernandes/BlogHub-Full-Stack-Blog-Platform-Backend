const mongoose = require("mongoose");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

// @desc    List all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: 1 });

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete any blog (admin only) — comments are cascaded too
// @route   DELETE /api/admin/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await Blog.deleteOne({ _id: blog._id });
    await Comment.deleteMany({ blog: blog._id });

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete any comment (admin only)
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
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

    await Comment.deleteOne({ _id: comment._id });

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUsers, deleteBlog, deleteComment };