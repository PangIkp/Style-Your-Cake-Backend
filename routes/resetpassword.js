const express = require("express");
const { forgotPassword, resetPassword } = require("../controllers/resetPasswordController");

const router = express.Router();

// Route to send OTP to the user's email
router.post("/forgot-password", forgotPassword);

// Route to verify OTP and reset password
router.post("/reset-password", resetPassword);

module.exports = router;
