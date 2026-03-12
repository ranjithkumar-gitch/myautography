const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  starId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  productName: String,

  price: Number,

  description: String,

  stock: Number,

  productImage: String

},
{
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);