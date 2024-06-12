const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    maxlength: [40, "Product Name can not be more than 40 characters"],
  },
  price: {
    type: Number,
    required: true,
  },
  detail: {
    type: String,
    required: true,
    maxlength: [100, "Detail can not be more than 100 characters"],
  },
  productPic: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
