import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI) {
  throw new Error("MONGODB_URI is not provided");
}

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_URI);

    console.log(`MongoDB connected: ${NODE_ENV} mode`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectToDatabase;
