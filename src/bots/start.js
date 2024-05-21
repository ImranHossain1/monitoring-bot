import userModel from "../models/User.js";

export async function start(ctx) {
  const from = ctx.update.message.from;
  await ctx.reply(
    `Hey! ${from.first_name}, welcome to my monitoring chatbot. `
  );
}
