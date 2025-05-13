import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect("mongodb+srv://food:food@cluster0.befmnzr.mongodb.net/food-del")
    .then(() => console.log("db connected"));
};
