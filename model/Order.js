const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      price: Number
    }
  ],

  totalAmount: Number,

  status: {
    type: String,
    enum: ["new", "shipping", "delivered", "cancelled"]
  }

},
{
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);