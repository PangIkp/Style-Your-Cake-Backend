const Product = require("../models/Product");

//@desc     Get all products
//@route    GET /api/v1/products
//@access   Public
exports.getProducts = async (req, res, next) => {
  let query;
  query = Product.find()
  try {
    const products = await query;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Product" });
  }
};

//@desc     Get single products
//@route    GET /api/v1/products/:id
//@access   Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Product" });
  }
};

//@desc     Add single product
//@route    POST /api/v1/products/
//@access   Private
exports.addProduct = async (req, res, next) => {
  try {

    //add user Id to req.body
    // req.body.user = req.user.id;
  
    const product = await Product.create(req.body);

    console.log(product);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Product" });
  }
};

//@desc     Update single booking
//@route    PUT /api/v1/hospitals/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with id ${req.params.id}`,
      });
    }

    //Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    if (req.body.campground) {
      const campground = await Campground.findById(
        req.body.campground
      ).populate("bookings");
      if (campground.bookings.length >= 10) {
        return res.status(400).json({
          success: false,
          message: `The campground with ID ${campground._id} can't have more than 10 bookings`,
        });
      }
    }

    const existedBookings = await Booking.find({
      user: booking.user.toString(),
    });
    if (!isValidDate(existedBookings, req.body.bookingDate)) {
      return res.status(400).json({
        success: false,
        message: `The required date ${req.body.bookingDate} is already booked or adjacent to any booked date`,
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Booking" });
  }
};

//@desc     Delete single booking
//@route    DELETE /api/v1/campgrounds/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No bookings with id ${req.params.id}`,
      });
    }

    //Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Booking" });
  }
};