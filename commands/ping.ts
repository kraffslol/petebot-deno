import { BaseCommand } from "./command.ts";
import { ApiClient } from "../api.ts";
import { DiscordMessageEventData } from "../types.ts";

export class PingCommand implements BaseCommand {
  prefix = "!ping";

  public handler = (message: DiscordMessageEventData, api: ApiClient) => {
    api.createMessage(message.channel_id, "pong");
  };
}
