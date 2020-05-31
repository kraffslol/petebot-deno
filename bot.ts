import {
  connectWebSocket,
  WebSocket,
} from "https://deno.land/std/ws/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";
import {
  OpCode,
  DiscordHelloData,
  DiscordPayload,
  DiscordReadyEventData,
  DiscordMessageEventData,
} from "./types.ts";
import { BaseCommand } from "./commands/command.ts";
import { ApiClient } from "./api.ts";

export class Bot {
  private sock?: WebSocket;
  private token: string;
  private endpoint: string;
  private sessionId: string = "";
  private heartbeatIntervalId?: number;
  private sequenceNo?: number;
  private gotAck: boolean = false;
  private commands!: BaseCommand[];
  public api: ApiClient;

  constructor(endpoint: string, token: string, api: ApiClient) {
    this.endpoint = endpoint;
    this.token = token;
    this.commands = [];
    this.api = api;
  }

  private send(opCode: OpCode, data: any) {
    return this.sock?.send(JSON.stringify({ op: opCode, d: data }));
  }

  private sendResume() {
    this.send(OpCode.RESUME, {
      token: this.token,
      session_id: this.sessionId,
      seq: this.sequenceNo,
    });
  }

  private async sendHeartbeat() {
    /* TODO: If a client does not receive a heartbeat ack between its attempts at
      sending heartbeats, it should immediately terminate the connection
      with a non-1000 close code, reconnect, and attempt to resume. */
    if (this.gotAck === false) {
      log.error("Never got ack, reconnect");
    }
    this.gotAck = false;
    this.send(OpCode.HEARTBEAT, this.sequenceNo);
  }

  private sendIdentify() {
    this.send(OpCode.IDENTIFY, {
      token: this.token,
      properties: {
        "$os": "linux",
        "$browser": "pete",
        "$device": "pete",
      },
    });
  }

  public async connect() {
    this.sock = await connectWebSocket(this.endpoint);
    log.info(`Connected to ${this.endpoint}`);
    await Promise.resolve(this.handleWSMessages()).catch(console.error);
    if (!this.sock.isClosed) {
      await this.disconnect();
    }
  }

  public async disconnect(code: number = 1000) {
    return this.sock?.close(code);
  }

  public addCommand(command: BaseCommand) {
    this.commands.push(command);
  }

  private handleDiscordEvents(payload: DiscordPayload) {
    switch (payload.t) {
      case "READY":
        log.info("Got READY event");
        this.sessionId = (payload.d as DiscordReadyEventData).session_id;
        break;
      case "MESSAGE_CREATE":
        const message = payload.d as DiscordMessageEventData;
        log.info(`${message.author.username}: ${message.content}`);
        this.commands.some(({ prefix, handler }) => {
          if (message.content.startsWith(prefix)) {
            handler(
              message.channel_id,
              this.api,
            );
            return true;
          }
          return false;
        });
        break;
    }
  }

  private async handleWSMessages(): Promise<void> {
    if (!this.sock) return;
    for await (const msg of this.sock) {
      if (typeof msg !== "string") return;
      const payload: DiscordPayload = JSON.parse(msg);

      if (payload.s) {
        this.sequenceNo = payload.s;
      }

      switch (payload.op) {
        case OpCode.DISPATCH:
          this.handleDiscordEvents(payload);
          break;
        case OpCode.HEARTBEAT:
          log.info("Got heartbeat");
          break;
        case OpCode.RECONNECT:
          log.info("Got reconnect");
          this.sendResume();
          break;
        case OpCode.INVALID_SESSION:
          log.info("Got invalid session");
          break;
        case OpCode.HELLO:
          log.info("Got hello");
          // Clear interval if it already exists.
          if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
          }
          this.heartbeatIntervalId = setInterval(
            () => {
              log.info("Sending heartbeat");
              this.gotAck = true;
              this.sendHeartbeat();
            },
            (payload.d as DiscordHelloData).heartbeat_interval,
          );
          log.info("Identifying");
          this.sendIdentify();
          break;
        case OpCode.HEARTBEAT_ACK:
          this.gotAck = true;
          break;
      }
    }
  }
}