import { GetGatewayResponse } from "./types.ts";

export class ApiClient {
  private endpoint: string;
  private token: string;
  private headers: Headers;

  constructor(endpoint: string, token: string) {
    this.endpoint = endpoint;
    this.token = token;
    this.headers = new Headers({
      "Authorization": `Bot ${this.token}`,
      "Content-Type": "application/json",
    });
  }

  public async getGateway() {
    const res = await fetch(`${this.endpoint}/gateway/bot`, {
      headers: this.headers,
    });
    const { url }: GetGatewayResponse = await res.json();
    return url;
  }

  public createMessage(channelId: string, message: string) {
    fetch(`${this.endpoint}/channels/${channelId}/messages`, {
      headers: this.headers,
      method: "POST",
      body: JSON.stringify({
        content: message,
      }),
    });
  }
}
