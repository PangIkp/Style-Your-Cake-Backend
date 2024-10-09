const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const products = require("./routes/products");
const authRoutes = require('./routes/auth');
const resetPasswordRoutes = require("./routes/resetpassword");
const cors = require('cors');

// Load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();
connectDB();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Product and Auth Routes
app.use("/api/v1/products", products);
app.use("/api/v1/auth", authRoutes);


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, "mode on port", PORT)
);

// Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
