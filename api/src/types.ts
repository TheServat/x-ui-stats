export interface ListResponse {
  success: boolean;
  msg: string;
  obj: Inbound[];
}

export interface ISetting {

  "clients":
  {
    "id": string,//"b3ac2bed-27c7-4317-abca-68c5297ccd35",
    "flow": string, //"",
    "email": string, //"1bqlp8hqj",
    "limitIp": number, //0,
    "totalGB": number, //0,
    "expiryTime": number, //0,
    "enable": boolean, //true,
    "tgId": string, //"",
    "subId": string, //""
  }[]
  ,
  "decryption": string,//"none",
  "fallbacks": any[]

}
export interface Inbound {
  id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiryTime: number;
  clientStats: ClientStat[];
  listen: string;
  port: number;
  protocol: string;
  settings: string;
  streamSettings: string;
  tag: string;
  sniffing: string;
}

export interface ClientStat {
  id: number;
  inboundId: number;
  enable: boolean;
  email: string;
  up: number;
  down: number;
  expiryTime: number;
  total: number;
}
