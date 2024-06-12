const express = require("express");
const {addProduct, getProducts, getProduct} = require("../controllers/products");


// const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(addProduct);

router
  .route("/:id")
  .get(getProduct);
//   .get(protect, getBooking)
//   .put(protect, authorize("admin", "user"), updateBooking)
//   .delete(protect, authorize("admin", "user"), deleteBooking);

module.exports = router;