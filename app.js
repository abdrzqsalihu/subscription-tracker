import express from "express";

import { PORT } from "./config/env.js";

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();

// / Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Middleware to parse cookies from incoming requests
app.use(cookieParser());

// Custom middleware for autorization and bot detection
app.use(arcjetMiddleware);

// Route handlers for different functionalities
app.use("/api/v1/auth", authRouter); // Authentication routes
app.use("/api/v1/users", userRouter); // User management routes
app.use("/api/v1/subscriptions", subscriptionRouter); // Subscription management routes
app.use("/api/v1/workflows", workflowRouter); // Workflow routes

// Middleware to handle errors globally
app.use(errorMiddleware);

// Start the server and connect to the database
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  await connectToDatabase(); // Connect to MongoDB when the server starts
});

export default app;
