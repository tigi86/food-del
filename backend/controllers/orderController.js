import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";
  try {
    // Get user ID from authenticated user

    const userId = req.user.id;

    // Validate required fields with better error messages
    if (!req.body.items || req.body.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (!req.body.amount || req.body.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    if (!req.body.address) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    // Create new order
    const newOrder = new orderModel({
      userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      status: "Food processing",
      payment: false,
    });

    await newOrder.save();

    // Clear user's cart with error handling
    try {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    } catch (cartError) {
      console.error("Error clearing cart:", cartError);
      // Continue with order even if cart clearing fails
    }

    // Prepare Stripe line items with validation
    const line_items = req.body.items.map((item) => {
      if (!item.price || !item.quantity) {
        throw new Error("Invalid item in cart");
      }
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || "Unnamed Item",
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery charges",
        },
        unit_amount: 200,
      },
      quantity: 1,
    });

    // Create Stripe session with timeout
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      },
      { timeout: 10000 }
    ); // 10 second timeout

    res.json({
      success: true,
      session_url: session.url,
      orderId: newOrder._id, // Return order ID for reference
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process your order",
      errorDetails:
        process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
//user ordersfor frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

//api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Eorror on status updating" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
