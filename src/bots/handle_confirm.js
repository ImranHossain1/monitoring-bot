import sessionManager from "../utils/sessionManager.js";

export async function handleConfirmAlert(ctx) {
  try {
    await ctx.answerCbQuery("Receipt confirmed. Thank you!");
    await ctx.editMessageText("Receipt confirmed. Thank you!");
    sessionManager.confirmSession(ctx.from.id);
  } catch (error) {
    console.log("Error handling confirmation:", error);
  }
}
