import express from "express";
import {
  loginUser,
  registerUser,
  verifyUserForPasswordReset,
  resetPassword,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/verify-forgot-password", verifyUserForPasswordReset);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
