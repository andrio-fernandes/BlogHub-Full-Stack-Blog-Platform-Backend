const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    // Reference to the User who created this blog.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt come free with this
  }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;