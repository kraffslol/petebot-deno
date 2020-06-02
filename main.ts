import { config } from "https://deno.land/x/dotenv@v0.4.1/mod.ts";
import { Bot } from "./bot.ts";
import { PingCommand } from "./commands/index.ts";

const { DISCORD_ENDPOINT, BOT_TOKEN } = config();

const main = async () => {
  try {
    const bot = new Bot(DISCORD_ENDPOINT, BOT_TOKEN);
    bot.addCommand(new PingCommand());
    await bot.connect();
  } catch (err) {
    console.error(err);
  }
};

main();
