import eventModel from "../models/Event.js";

export async function handleReply(ctx) {
  const replyToMessage = ctx.message.reply_to_message;
  if (replyToMessage) {
    const repliedMessageId = replyToMessage.message_id;

    try {
      // Find the event with the replied message ID in the messageIds array
      const event = await eventModel.findOne({
        messageIds: repliedMessageId,
      });

      if (event) {
        if (event.confirmed) {
          ctx.reply("It's already confirmed.");
          console.log(
            `Event with messageId ${repliedMessageId} is already confirmed.`
          );
        } else {
          event.confirmed = true;
          await event.save();
          ctx.reply(
            "Thank you for confirming. Your confirmation has been logged."
          );
          console.log(
            `Event with messageId ${repliedMessageId} marked as confirmed.`
          );
        }
      } else {
        console.log(`No event found with messageId ${repliedMessageId}.`);
      }
    } catch (error) {
      console.log("Error:", error);
      ctx.reply("There was an error processing your confirmation.");
    }
  }
}
