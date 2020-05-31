import { BaseCommand } from "./command.ts";
import { ApiClient } from "../api.ts";

export class PingCommand extends BaseCommand {
  constructor() {
    super("!ping");
  }

  public handler(
    channelId: string,
    api: ApiClient,
  ) {
    api.createMessage(channelId, "pong");
  }
}
