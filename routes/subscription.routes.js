import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getUpcomingRenewals,
  getUserSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const subscriptionRouter = Router();

// Admin-only route to get all subscriptions
subscriptionRouter.get("/", authorize, authorizeAdmin, getAllSubscriptions);

// Route to create a new subscription for the logged-in user
subscriptionRouter.post("/", authorize, createSubscription);

// Route to get upcoming renewals for the logged-in user
subscriptionRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);

// Route to cancel a subscription
subscriptionRouter.put("/:id", authorize, updateSubscription);

// Route to delete a subscription
subscriptionRouter.delete("/:id", authorize, deleteSubscription);

// Route to get all subscriptions for a specific user
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

// Route to get a subscription by ID (only accessible by the owner or admin)
subscriptionRouter.get("/:id", authorize, getSubscriptionById);

// Route to cancel a subscription
subscriptionRouter.patch("/:id/cancel", authorize, cancelSubscription);

export default subscriptionRouter;
