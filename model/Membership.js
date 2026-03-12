const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({

  starId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  planType: {
    type: String,
    enum: ["weekly", "monthly", "yearly"]
  },

  price: {
    type: Number
  }

},
{
  timestamps: true
});

module.exports = mongoose.model("Membership", membershipSchema);