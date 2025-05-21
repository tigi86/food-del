import express from "express";
import {
  addFood,
  listFood,
  removeFood,
} from "../controllers/foodControllers.js";
import upload from "../middleware/multer.js";

const foodRouter = express.Router();

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);

export default foodRouter;
