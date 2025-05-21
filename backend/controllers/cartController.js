import userModel from "../models/userModel.js";

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize cartData if it doesn't exist
    if (!user.cartData) {
      user.cartData = {};
    }

    // Update cart
    user.cartData[itemId] = (user.cartData[itemId] || 0) + 1;

    await user.save();
    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user || !user.cartData) {
      return res
        .status(404)
        .json({ success: false, message: "User or cart not found" });
    }

    if (user.cartData[itemId] > 0) {
      user.cartData[itemId] -= 1;
      if (user.cartData[itemId] === 0) {
        delete user.cartData[itemId];
      }
      await user.save();
    }

    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cart
const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize cart if it doesn't exist
    if (!user.cartData) {
      user.cartData = {};
      await user.save();
    }

    res.json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Failed to load cart" });
  }
};

export { addToCart, removeFromCart, getCart };
