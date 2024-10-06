const User = require("../models/User");

//@desc     User Signup
//@route    POST /api/v1/auth/signup
//@access   Public
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Ensure 'username' and 'password' are provided
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Please provide both username and password." });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Check if password matches (implement your password checking logic here)
    // Assuming password is stored in plaintext (not recommended for production)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Send success response
    res.status(200).json({ success: true, message: "Login successful!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error logging in. ${err}" });
  }
};

exports.signup = async (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;

  try {
    // Ensure all required fields are provided
    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    // Generate a unique ID based on the current user count
    const userCount = await User.countDocuments();
    const newId = userCount + 1; // Unique ID starts from 1

    // Create a new user
    const user = await User.create({
      id: newId, // Use the generated ID
      username,
      firstName,
      lastName,
      email,
      password, // Ideally, you should hash the password before saving
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }
    res.status(500).json({ success: false, message: "Error creating user." });
  }
};
