const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
// Configure transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate a 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// @desc     User Signup
// @route    POST /api/v1/auth/signup
// @access   Public
exports.signup = async (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;

  try {
    // Ensure all required fields are provided
    if (!username || !firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields.",
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    // Generate a unique ID based on the current user count
    const userCount = await User.countDocuments();
    const newId = userCount + 1; // Unique ID starts from 1

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the hashed password
    const user = await User.create({
      id: newId, // Use the generated ID
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store the hashed password
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }
    res.status(500).json({ success: false, message: "Error creating user." });
  }
};

// @desc     User Login
// @route    POST /api/v1/auth/login
// @access   Public
exports.login = async (req, res) => {
  const { userNameOrEmail, password } = req.body;
  // console.log(username);

  try {
    // Ensure 'username' and 'password' are provided
    if (!userNameOrEmail || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide both username and password.",
        });
    }

    // Regular expression to check if the input is an email
    const isEmail = /\S+@\S+\.\S+/.test(userNameOrEmail);

    let user;

    // Check if the input is an email or username and find user accordingly
    if (isEmail) {
      // If the input is an email
      user = await User.findOne({ email: userNameOrEmail });
    } else {
      // If the input is a username
      user = await User.findOne({ username: userNameOrEmail });
    }

    console.log(user);
    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid credentials (No user found).",
        });
    }

    // Check if the provided password matches the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid credentials. (Wrong password)",
        });
    }

    // Send success response
    res.status(200).json({ success: true, message: "Login successful!", user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: `Error logging in. ${err}` });
  }
};

// @desc     Forgot Password - Send OTP
// @route    POST /api/v1/auth/forgot-password
// @access   Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide an email." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({
          success: true,
          message:
            "If that email address is in our database, we will send you an OTP to reset your password.",
        });
    }

    const otp = generateOTP();
    user.resetOTP = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hello ${user.firstName},\n\nYour OTP for password reset is: ${otp}\nIt will expire in 10 minutes.\nIf you did not request this, please ignore this email.\n\nBest regards,\nYour Company Name`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({
        success: true,
        message:
          "If that email address is in our database, we will send you an OTP to reset your password.",
      });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ success: false, message: "Error sending OTP." });
  }
};

// @desc     Reset Password - Verify OTP and Reset Password
// @route    POST /api/v1/auth/reset-password
// @access   Public
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide email, OTP, and new password.",
        });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOTP || !user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    if (user.resetOTP !== otp || Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Password has been reset successfully.",
      });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res
      .status(500)
      .json({ success: false, message: "Error resetting password." });
  }
};
