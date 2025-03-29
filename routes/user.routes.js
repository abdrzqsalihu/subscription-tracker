import { Router } from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

// Get all users (Admin only)
userRouter.get("/", authorize, getUsers);
// Get a specific user by ID (Admin or the user themselves)
userRouter.get("/:id", authorize, getUser);
// Update user details (User can update their own details, and admin can update any user)
userRouter.put("/:id", authorize, updateUser);
// Delete a user (User can delete their own accout, and admin can delete any user)
userRouter.delete("/:id", authorize, deleteUser);

export default userRouter;
