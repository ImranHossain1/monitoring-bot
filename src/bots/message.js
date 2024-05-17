import { Telegraf } from "telegraf";
import eventModel from "../models/Event.js";
import userModel from "../models/User.js";
import sessionManager from "../utils/sessionManager.js";
const bot = new Telegraf(process.env.BOT_TOKEN);

export async function handleMessage(ctx) {
  const from = ctx.update.message.from;
  const chatId = ctx.update.message.chat.id;
  const message = ctx.update.message.text;
  const groupChatId = process.env.GROUP_CHAT_ID;
  const destinationChatId = process.env.DEST_CHAT_ID;
  const sessionTimeout = 30000; // 30 seconds

  // Only reply to the user if the message is from a direct chat
  if (ctx.chat.type === "private") {
    await ctx.reply(
      `Hey! ${from.first_name}, welcome. I will be writing highly engaging social media posts for you, just keep feeding me with the events throughout the day. Let's shine on social media.`
    );
  }
  // Check if the message is from the group chat
  if (chatId.toString() !== groupChatId) {
    console.log("Message is not from the specified group chat, ignoring.");
    return; // Ignore messages not from the specified group
  }

  try {
    // Check if the user already exists
    const existingUser = await userModel.findOne({ tgId: from.id });

    if (!existingUser) {
      // If the user does not exist, create a new user
      await userModel.create({
        tgId: from.id,
        firstname: from.first_name,
        lastName: from.last_name,
        isBot: from.is_bot,
        username: from.username,
      });
      console.log("New user created");
    }

    // Start or continue the session
    sessionManager.startSession(
      from.id,
      message,
      async (userId, messages) => {
        // Save aggregated messages to the database
        const event = await eventModel.create({
          tgId: userId,
          texts: messages,
          messageIds: [],
          confirmed: false,
        });
        console.log(`Messages saved to eventModel for user ${userId}`);

        // Send aggregated messages to the destination chat ID
        // Get the count of messages
        const messageCount = messages.length;

        // Send aggregated messages to the destination chat ID
        const aggregatedMessage =
          `You have ${messageCount} new service alerts in the last 5 minutes. \n Please confirm receipt by replying 'CONFIRM'
          \n` + messages.join("\n");

        const sentMessage = await bot.telegram.sendMessage(
          destinationChatId,
          aggregatedMessage
        );
        console.log(
          `Messages sent to destination chat ID: ${destinationChatId}`
        );

        // Save the sent message ID and the event ID
        event.messageIds.push(sentMessage.message_id);
        await event.save();
        setTimeout(async () => {
          const existsMessage = await eventModel.findOne({
            messageId: event.messageId,
          });
          if (existsMessage) {
            const aggregatedResendMessage =
              `Reminder: Please confirm receipt of the recent service alerts by replying '/CONFIRM'.
          \n` + messages.join("\n");
            // Send the message to destinationChatId
            const resendMessage = await bot.telegram.sendMessage(
              destinationChatId,
              aggregatedResendMessage
            );
            existsMessage.messageIds.push(resendMessage.message_id);
            await existsMessage.save();
            console.log(
              `Resending message to destination chat ID: ${destinationChatId}`
            );
          }
        }, sessionTimeout);
      },
      async (messages) => {}
    );
  } catch (error) {
    console.log("Error:", error);
    await ctx.reply("Facing difficulties");
  }
}
