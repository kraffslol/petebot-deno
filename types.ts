export enum OpCode {
  DISPATCH = 0,
  HEARTBEAT = 1,
  IDENTIFY = 2,
  PRESENCE_UPDATE = 3,
  VOICE_STATE_UPDATE = 4,
  RESUME = 6,
  RECONNECT = 7,
  REQUEST_GUILD_MEMBERS = 8,
  INVALID_SESSION = 9,
  HELLO = 10,
  HEARTBEAT_ACK = 11,
}

export type GetGatewayResponse = {
  url: string;
  shards: number;
  session_start_limit: {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
  };
};

export type DiscordPayload = {
  op: OpCode;
  d?:
    | DiscordHelloData
    | DiscordReadyEventData
    | DiscordMessageEventData;
  s: number | null;
  t: string | null;
};

export type DiscordHelloData = {
  heartbeat_interval: number;
};

export type DiscordReadyEventData = {
  v: number;
  user: {
    username: string;
  };
  private_channels: string[];
  guilds: string[];
  session_id: string;
};

export type DiscordMessageEventData = {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: any;
  content: string;
};
