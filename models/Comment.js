const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // Which blog this comment belongs to.
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    // Who wrote it.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true, // createdAt lets us sort comments oldest → newest
  }
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;