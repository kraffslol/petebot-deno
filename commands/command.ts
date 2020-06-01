import { ApiClient } from "../api.ts";
import { DiscordMessageEventData } from "../types.ts";

export interface BaseCommand {
  prefix: string;
  handler(message: DiscordMessageEventData, api: ApiClient): void;
}
