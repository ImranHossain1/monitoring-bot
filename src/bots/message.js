import { Markup } from "telegraf";
import sessionManager from "../utils/sessionManager.js";

export async function handleMessage(ctx) {
  const hostGroup = ctx.update.message.chat.title;
  const from = ctx.update.message.from;
  const chatId = ctx.update.message.chat.id;
  const message = ctx.update.message.text;
  const groupChatId = process.env.GROUP_CHAT_ID;
  const destinationChatId = process.env.DEST_CHAT_ID;

  if (chatId.toString() !== groupChatId) {
    console.log("Message is not from the specified group chat, ignoring.");
    return;
  }

  try {
    sessionManager.startSession(
      from.id,
      message,
      hostGroup, // Pass the hostGroup
      (sessionId, messages) => {
        console.log(`Messages saved for session ID: ${sessionId}`);
      },
      async (sessionId, aggregatedMessage) => {
        const keyboard = Markup.inlineKeyboard([
          Markup.button.callback("CONFIRM", `confirm_alert_${sessionId}`),
        ]);

        const messageSent = await ctx.telegram.sendMessage(
          destinationChatId,
          aggregatedMessage,
          keyboard
        );
        console.log(
          `Messages sent to destination chat ID: ${destinationChatId}`
        );
        return messageSent.message_id;
      },
      async (sessionId, aggregatedMessage) => {
        const keyboard = Markup.inlineKeyboard([
          Markup.button.callback("CONFIRM", `confirm_alert_${sessionId}`),
        ]);

        const reminderSent = await ctx.telegram.sendMessage(
          destinationChatId,
          `Reminder: ${aggregatedMessage}`,
          keyboard
        );
        return reminderSent.message_id;
      }
    );
  } catch (error) {
    console.log("Error:", error);
    await ctx.reply("Facing difficulties");
  }
}
