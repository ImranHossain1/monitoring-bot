import { Markup } from "telegraf";
import sessionManager from "../utils/sessionManager.js";
import { countIPAddresses } from "../utils/extractIpAddress.js";

export async function handleMessage(ctx) {
  const hostGroup = ctx.update.message.chat.title;
  const from = ctx.update.message.from;
  const chatId = ctx.update.message.chat.id;
  const message = ctx.update.message.text;
  const groupChatId = process.env.GROUP_CHAT_ID;
  const destinationChatId = process.env.DEST_CHAT_ID;

  // Check if the message is from the group chat
  if (chatId.toString() !== groupChatId) {
    console.log("Message is not from the specified group chat, ignoring.");
    return; // Ignore messages not from the specified group
  }

  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback("CONFIRM", "confirm_alert"),
  ]);

  try {
    // Start or continue the session
    sessionManager.startSession(
      from.id,
      message,
      (userId, messages) => {
        // Save callback (can be used to save messages if needed)
        console.log(`Messages saved for user ID: ${userId}`);
      },
      async (userId, messages) => {
        // Count IP addresses in the aggregated messages
        const individualIpSummary = countIPAddresses(messages);

        // Send callback (sends the messages after 10 seconds)
        // Construct the aggregated message
        let aggregatedMessage = `You have ${messages.length} new service alerts in the last 5 minutes. Please confirm receipt.\n`;

        for (const [ip, details] of Object.entries(individualIpSummary)) {
          aggregatedMessage +=
            `\n\nSystemd Service Summary: \n${details.firstSummary} -> ${details.lastSummary}\n\n` +
            `OUTPUT:\nTotal: ${details.count} \nInitial State: ${details.firstStateChange}\n` +
            `Current State : ${details.lastStateChange}\n\n\n` +
            `DETAILS:\nIPv4: ${ip}\nHOSTGROUP: ${hostGroup}`;
        }

        await ctx.telegram.sendMessage(
          destinationChatId,
          aggregatedMessage,
          keyboard
        );

        console.log(
          `Messages sent to destination chat ID: ${destinationChatId}`
        );
      },
      async (userId) => {
        // Reminder callback (sends the reminder after 15 seconds if not confirmed)
        await ctx.telegram.sendMessage(
          destinationChatId,
          "Reminder: Please confirm receipt of the message.",
          keyboard
        );
      }
    );
  } catch (error) {
    console.log("Error:", error);
    await ctx.reply("Facing difficulties");
  }
}
