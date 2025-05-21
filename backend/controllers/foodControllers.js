import Food from "../models/foodModel.js";
import { v2 as cloudinary } from "cloudinary";

const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided" });
    }

    // Convert to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "food-del",
    });

    // Save to database
    const newFood = new Food({
      ...req.body,
      price: Number(req.body.price),
      image: result.secure_url,
    });

    await newFood.save();
    res.status(201).json({ success: true, message: "Food added!" });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// List All Foods
const listFood = async (req, res) => {
  try {
    const foods = await Food.find({}).select(
      "name description price category image"
    );

    res.status(200).json({
      success: true,
      foods, // Changed from 'data' to 'foods' to match frontend
    });
  } catch (error) {
    console.error("List food error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch food list",
    });
  }
};
// Delete Food (No Cloudinary cleanup)
const removeFood = async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.body.id);
    res.status(200).json({ success: true, message: "Food removed!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addFood, listFood, removeFood };
