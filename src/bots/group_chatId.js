export async function getGroupId(ctx) {
  const chatId = ctx.chat.id;
  await ctx.reply(`The chat ID is: ${chatId}`);
}
