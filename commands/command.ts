import { ApiClient } from "../api.ts";

export class BaseCommand {
  public prefix!: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  public handler(
    channelId: string,
    api: ApiClient,
  ) {}
}
