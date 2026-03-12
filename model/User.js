const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["star", "stargazer"],
    required: true
  },
  phone:{
    type: String,
     required: true 
  },
  dateOfBirth: {
    type: Date,
    required: true
  },

  verificationStatus: {
    type: String,
    enum: ["pending", "verified"],
    default: "pending"
  },

  profileImage: String,
  coverImage: String,
  bio: String,
  address: String

},
{
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);