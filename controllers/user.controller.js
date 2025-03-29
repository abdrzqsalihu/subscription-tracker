import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

//  Get all users (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    // Ensure only admins can fetch all users
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const users = await User.find().select("-password"); // Exclude passwords from response

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

//  Get a specific user by ID (Admin or the user themselves)
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Exclude password

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure the user is either requesting their own profile or an admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

//  Update user details (User can update their own details, and admin can update any user)
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Ensure only the owner or an admin can update
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update only provided fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//  Delete a user (Users can delete their own account, and admins can delete any user)
export const deleteUser = async (req, res, next) => {
  try {
    // Ensure the user can only delete their own account unless they are an admin
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
