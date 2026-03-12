const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  commentText: String,

  rating: {
    type: Number,
    min: 1,
    max: 5
  }

},
{
  timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);