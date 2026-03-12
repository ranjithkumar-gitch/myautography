const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({

  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  starId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership"
  },

  status: {
    type: String,
    default: "active"
  }

},
{
  timestamps: true
});

module.exports = mongoose.model("Subscription", subscriptionSchema);