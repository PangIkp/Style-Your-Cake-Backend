// routes/authRoutes.js
const express = require("express");
const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController");

const router = express.Router();

// @route   POST /api/v1/auth/signup
router.post("/signup", signup);

// @route   POST /api/v1/auth/login
router.post("/login", login);

// @route   POST /api/v1/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// @route   POST /api/v1/auth/reset-password
router.post("/reset-password", resetPassword);

module.exports = router;
