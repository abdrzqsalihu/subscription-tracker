import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getUserSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const subscriptionRouter = Router();

// Admin-only route to get all subscriptions
subscriptionRouter.get("/", authorize, authorizeAdmin, getAllSubscriptions);

subscriptionRouter.post("/", authorize, createSubscription);

subscriptionRouter.put("/:id", authorize, updateSubscription);

subscriptionRouter.delete("/:id", (req, res) =>
  res.send({ title: "Delete subscription by id" })
);

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);

subscriptionRouter.get("/:id", authorize, getSubscriptionById);

subscriptionRouter.delete("/:id/cancel", (req, res) =>
  res.send({ title: "Cancel subscription" })
);

subscriptionRouter.get("/upcoming-renewals", (req, res) =>
  res.send({ title: "GET all user upcoming subscription" })
);

export default subscriptionRouter;
