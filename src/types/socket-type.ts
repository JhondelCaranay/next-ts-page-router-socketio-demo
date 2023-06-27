import type { Server as HTTPServer } from "http";
import type { NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";

// https://github.com/vercel/next.js/discussions/48422
// https://github.com/vercel/next.js/discussions/48422

export interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export interface ClientToServerEvents {
  JOIN_ROOM_EVENT: (room: string) => void;
  LEAVE_ROOM_EVENT: (room: string) => void;

  SEND_MESSAGE_EVENT: (obj: Message) => void;
  CREATED_MESSAGE: (msg: Message) => void;

  START_TYPING_MESSAGE_EVENT: (obj: Message) => void;
  STOP_TYPING_MESSAGE_EVENT: (obj: Message) => void;
}

export interface ServerToClientEvents {
  RECEIVE_MESSAGE_EVENT: (obj: Message) => void;
  NEW_INCOMING_MESSAGE_EVENT: (msg: Message) => void;
  USER_HAS_JOINED_EVENT: (msg: string) => void;

  START_TYPING_MESSAGE_EVENT: (obj: Message) => void;
  STOP_TYPING_MESSAGE_EVENT: (obj: Message) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  // name: string;
  // age: number;
}

type Message = {
  author: string;
  message: string;
  room: string;
};
