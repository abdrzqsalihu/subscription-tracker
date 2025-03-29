import dayjs from "dayjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

const REMINDERS = [7, 5, 2, 1]; // Days before renewal to send reminders

//  Workflow to send subscription renewal reminders
export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = dayjs(subscription.renewalDate);

  // Stop workflow if renewal date has already passed
  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`
    );
    return;
  }

  // Iterate through reminder schedule
  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    // Wait until the reminder date is reached
    if (reminderDate.isAfter(dayjs())) {
      await scheduleReminder(
        context,
        `Reminder ${daysBefore} days before`,
        reminderDate
      );
    }

    // Send reminder if today matches the scheduled reminder date
    if (dayjs().isSame(reminderDate, "day")) {
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription
      );
    }
  }
});

//  Fetch subscription details from the database
const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });
};

//  Schedule a reminder to be sent at a later time
const scheduleReminder = async (context, label, date) => {
  console.log(`Scheduling ${label} reminder for ${date}`);
  await context.sleepUntil(label, date.toDate());
};

//  Trigger an email reminder to the user
const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Sending ${label} reminder to ${subscription.user.email}`);

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};
