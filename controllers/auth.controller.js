/* eslint-disable no-unused-vars */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

// function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin }, // Include isAdmin in token
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// User registration (sign-up) controller
export const signUp = async (req, res, next) => {
  // Start a database session for transactions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    // Check if a user already exists with the provided email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in the database with transaction support
    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    );

    // Generate authentication token for the new user
    const token = generateToken(newUsers[0]);

    // Commit transaction and end session
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    // Abort transaction and end session in case of an error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// User login (sign-in) controller
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    // Generate authentication token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User sign-out controller
export const signOut = async (req, res, next) => {};
