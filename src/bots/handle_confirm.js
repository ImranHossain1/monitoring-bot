import sessionManager from "../utils/sessionManager.js";
import { summarizeMessage } from "../utils/summarizeMessage.js";

export async function handleConfirmAlert(ctx) {
  try {
    const sessionId = ctx.callbackQuery.data.split("_")[2];
    await ctx.answerCbQuery("Receipt confirmed. Thank you!");
    const messageIds = sessionManager.confirmSession(sessionId);
    if (messageIds) {
      const originalMessage = ctx.update.callback_query.message.text;
      const summaryMessages = summarizeMessage(originalMessage);

      for (const messageId of messageIds) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          messageId,
          undefined,
          summaryMessages
        );
      }
    }
  } catch (error) {
    console.log("Error handling confirmation:", error);
  }
}
