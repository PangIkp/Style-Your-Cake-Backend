const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const products = require("./routes/products")
// Load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();
connectDB();
// app.get("/", (req, res) => {
//   res.status(200).json({ success: true, data: { id: 1 } });
// });
app.use(express.json());
app.use("/api/v1/products",products);


const PORT = process.env.PORT || 3001;
app.listen(
  PORT,
  console.log("Server runing in ", process.env.NODE_ENV, " mode on port ", PORT)
);

//Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
