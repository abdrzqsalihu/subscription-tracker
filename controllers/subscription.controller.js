import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

//  Get all subscriptions (Admin only)
export const getAllSubscriptions = async (req, res, next) => {
  try {
    // Ensure only admins can access this
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Fetch all subscriptions and populate user details (name and email)
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

//  Create a new subscription for the logged-in user
export const createSubscription = async (req, res, next) => {
  try {
    // Create a new subscription with the user's ID
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    // Trigger a workflow for subscription reminders
    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: { subscriptionId: subscription.id },
      headers: { "content-type": "application/json" },
      retries: 0,
    });

    res.status(201).json({
      success: true,
      data: { subscription, workflowRunId },
    });
  } catch (e) {
    next(e);
  }
};

//  Update a subscription (Only the owner or an admin can update)
export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the subscription by ID
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Ensure the user is either the owner of the subscription or an admin
    if (
      req.user._id.toString() !== subscription.user.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Define allowed fields for update
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

    // Update only allowed fields
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

//  Delete a subscription (Only the owner or an admin can delete)
export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the subscription by ID
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Ensure the user is either the owner or an admin
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

//  Cancel a subscription (Only the owner or an admin can cancel)
export const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the subscription by ID
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    // Ensure the user is either the owner or an admin
    if (
      req.user._id.toString() !== subscription.user.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Update the status to "canceled"
    subscription.status = "canceled";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

//  Get subscriptions of a specific user (Only the user can fetch their subscriptions)
export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Ensure the logged-in user is the same as the requested user
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    // Fetch subscriptions for the user
    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};

//  Get a subscription by ID (Only the owner or an admin can access)
export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch the subscription and populate user details
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

    // Ensure the user is either the owner or an admin
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

// Get upcoming subscription renewals (Admins see all, users see their own)
export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const { isAdmin, _id: userId } = req.user;

    // If admin, fetch all renewals; otherwise, fetch only the user's renewals
    const filter = isAdmin ? {} : { user: userId };

    // Fetch active subscriptions with future renewal dates, sorted by nearest renewal first
    const upcomingSubscriptions = await Subscription.find({
      ...filter,
      status: "active",
      renewalDate: { $gte: new Date() },
    })
      .populate("user", "name email")
      .sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      data: upcomingSubscriptions,
    });
  } catch (error) {
    next(error);
  }
};
