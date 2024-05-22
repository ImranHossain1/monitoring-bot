import { Telegraf } from "telegraf";
import { start } from "./src/bots/start.js";
import { handleMessage } from "./src/bots/message.js";
import { getGroupId } from "./src/bots/group_chatId.js";
import { handleReply } from "./src/bots/handle_reply.js";
import { message } from "telegraf/filters";
import { handleConfirmAlert } from "./src/bots/handle_confirm.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(start);
bot.command("getGroupId", getGroupId);
bot.command("confirm", handleReply);
bot.action(/confirm_alert_(.+)/, handleConfirmAlert);
bot.on(message("text"), handleMessage);
export default bot;
