import dotenv from "dotenv";
dotenv.config();

// Debug environment variables
console.log("Loaded Environment Variables:", {
  db: !!process.env.MONGODB_URI,
  jwt: !!process.env.JWT_SECRET, // Added this check
  cloudinary: !!process.env.CLOUDINARY_NAME,
  cloudKey: !!process.env.CLOUDINARY_API_KEY,
  cloudSecret: !!process.env.CLOUDINARY_SECRET_KEY,
});

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRout.js";
import connectCloudinary from "./config/cloudinary.js";
import cartRouter from './routes/cartRoute.js';
import userRouter from "./routes/userRoute.js"; // Import the user router
import orderRouter from "./routes/orderRoute.js";

const app = express();
const port = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Initialize DB and Cloudinary
connectDB();
connectCloudinary();

// Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter); // Use the user router
app.use('/api/cart', cartRouter); 
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("Food-Del API Running!");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
