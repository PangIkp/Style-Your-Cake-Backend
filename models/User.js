const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
    trim: true,
    maxlength: [40, "Username cannot be more than 40 characters"],
  },
  firstName: {
    type: String,
    required: [true, "Please provide your first name"],
    trim: true,
    maxlength: [40, "First Name cannot be more than 40 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"],
    trim: true,
    maxlength: [40, "Last Name cannot be more than 40 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, "Email cannot be more than 100 characters"],
    match: [/\S+@\S+\.\S+/, "Email is invalid"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
