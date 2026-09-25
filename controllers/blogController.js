const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

// Escape regex metacharacters so user input is treated literally in $regex.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Simple validation helper — no validation library needed.
const validateBlog = ({ title, content }) => {
  if (!title || !content) return "Title and content are required";
  if (title.trim().length < 3) return "Title must be at least 3 characters";
  if (title.trim().length > 200) return "Title must be 200 characters or fewer";
  if (content.trim().length < 10) return "Content must be at least 10 characters";
  return null;
};

// Helper: true if this blog was written by the logged-in user.
const isOwner = (blog, userId) => {
  const authorId = blog.author && blog.author._id ? blog.author._id : blog.author;
  return String(authorId) === String(userId);
};

// @desc    Get all blogs, newest first. Supports ?search= for title search.
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    // Case-insensitive partial match on the title ("i" = ignore case).
    const filter = search
      ? { title: { $regex: escapeRegex(search), $options: "i" } }
      : {};

    const blogs = await Blog.find(filter)
      .populate("author", "name email") // replace author id with author details
      .sort({ createdAt: -1 });          // newest post first

    res.json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all blogs written by the logged-in user
// @route   GET /api/blogs/my
// @access  Private
const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single blog by id
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const blog = await Blog.findById(id).populate("author", "name email");

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private (must be logged in)
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    const error = validateBlog({ title, content });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const blog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id, // comes from the protect middleware
    });

    res.status(201).json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a blog (author only)
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // AUTHORIZATION CHECK: only the writer may edit. 403 = forbidden.
    if (!isOwner(blog, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit blogs you created",
      });
    }

    const error = validateBlog({ title, content });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    blog.title = title.trim();
    blog.content = content.trim();
    await blog.save();

    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a blog (author only)
// @route   DELETE /api/blogs/:id
// @access  Private
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

    if (!isOwner(blog, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete blogs you created",
      });
    }

    await Blog.deleteOne({ _id: blog._id });

    // Cascade: remove the comments that belonged to this blog too.
    await Comment.deleteMany({ blog: blog._id });

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getBlogs,
  getMyBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};