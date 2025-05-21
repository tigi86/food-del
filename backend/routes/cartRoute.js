import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
} from "../controllers/cartController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Correct endpoint paths
router.get("/get", authMiddleware, getCart);  // Changed from POST to GET
router.post("/add", authMiddleware, addToCart);
router.post("/remove", authMiddleware, removeFromCart);

export default router;
