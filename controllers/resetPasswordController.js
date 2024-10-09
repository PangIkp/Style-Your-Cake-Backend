const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Configure environment variables for email credentials
// It's recommended to use environment variables for sensitive information
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Forgot Password - Send OTP
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // To prevent email enumeration, you can send the same response
      return res.status(200).json({ success: true, message: "If that email address is in our database, we will send you an OTP to reset your password." });
    }

    // Generate OTP and set expiration time (10 minutes)
    const otp = generateOTP();
    user.resetOTP = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Hello ${user.firstName},\n\nYour OTP for password reset is: ${otp}\nIt will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nYour Company Name`,
    };

    // Send OTP via email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "If that email address is in our database, we will send you an OTP to reset your password." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ success: false, message: "Error sending OTP." });
  }
};

// @desc    Reset Password - Verify OTP and Reset Password
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide email, OTP, and new password." });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP || !user.otpExpires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Check if OTP is correct and not expired
    if (user.resetOTP !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password and clear OTP fields
    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ success: false, message: "Error resetting password." });
  }
};
