import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const getAllSubscriptions = async (req, res, next) => {
  try {
    // Ensure only admins can access this
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const subscriptions = await Subscription.find().populate(
      "user",
      "name email"
    );

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res.status(201).json({
      success: true,
      data: {
        subscription,
        workflowRunId,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the subscription
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Check if the user is the owner OR an admin
    if (
      req.user._id.toString() !== subscription.user.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Update only allowed fields
    const allowedUpdates = [
      "name",
      "price",
      "currency",
      "frequency",
      "category",
      "paymentMethod",
      "status",
      "renewalDate",
    ];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        subscription[key] = updates[key];
      }
    });

    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the subscription
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Check if the user is the owner OR an admin
    if (
      req.user._id.toString() !== subscription.user.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Delete the subscription
    await subscription.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Subscription deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the subscription
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Check if the user is the owner OR an admin
    if (
      req.user._id.toString() !== subscription.user.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Update the status to "canceled"
    subscription.status = "canceled";
    await subscription.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Subscription canceled successfully",
        data: subscription,
      });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id).populate(
      "user",
      "name email"
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check if the user is the owner OR an admin
    if (
      req.user._id.toString() !== subscription.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own subscriptions.",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};
