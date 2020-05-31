import { config } from "https://deno.land/x/dotenv@v0.4.1/mod.ts";
import { Bot } from "./bot.ts";
import { PingCommand } from "./commands/index.ts";
import { ApiClient } from "./api.ts";

const { DISCORD_ENDPOINT, BOT_TOKEN } = config();

const main = async () => {
  try {
    const apiClient = new ApiClient(DISCORD_ENDPOINT, BOT_TOKEN);
    const gateway = await apiClient.getGateway();
    const bot = new Bot(gateway, BOT_TOKEN, apiClient);
    bot.addCommand(new PingCommand());
    await bot.connect();
  } catch (err) {
    console.error(err);
  }
};

main();
