import sessionManager from "../utils/sessionManager.js";

export async function handleConfirmAlert(ctx) {
  try {
    const sessionId = ctx.callbackQuery.data.split("_")[2];
    await ctx.answerCbQuery("Receipt confirmed. Thank you!");
    await ctx.editMessageText("Receipt confirmed. Thank you!");
    sessionManager.confirmSession(sessionId);
  } catch (error) {
    console.log("Error handling confirmation:", error);
  }
}
