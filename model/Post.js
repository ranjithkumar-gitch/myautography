const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  postType: {
    type: String,
    enum: ["stills", "bits", "video"]
  },

  mediaUrl: String,

  description: String,

  publishType: {
    type: String,
    enum: ["now", "schedule"]
  },

  scheduleTime: Date

},
{
  timestamps: true
});

module.exports = mongoose.model("Post", postSchema);