import {
  ClientToServerEvents,
  InterServerEvents,
  NextApiResponseWithSocket,
  ServerToClientEvents,
  SocketData,
} from "@/types/socket-type";
import typingUserHandlers from "@/utils/socket-handler/typingUserHandlers";
import type { NextApiRequest } from "next";
import { Server } from "socket.io";

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("New client connected ::: " + socket.id);

      socket.on("JOIN_ROOM_EVENT", (room) => {
        socket.join(room);
        socket.to(room).emit("USER_HAS_JOINED_EVENT", "A new user has joined the room");
      });

      // leave room
      socket.on("LEAVE_ROOM_EVENT", (room) => {
        socket.leave(room);
      });

      socket.on("CREATED_MESSAGE", (msg) => {
        // https://socket.io/docs/v4/emit-cheatsheet/
        // socket.broadcast.emit("NEW_INCOMING_MESSAGE_EVENT", msg);
        socket.to(msg.room).emit("NEW_INCOMING_MESSAGE_EVENT", msg);
      });

      // handlers 
      typingUserHandlers(io, socket);

      // Listen typing events
      // socket.on("START_TYPING_MESSAGE_EVENT", (data) => {
      //   io.in(data.room).emit("START_TYPING_MESSAGE_EVENT", data);
      // });
      // socket.on("STOP_TYPING_MESSAGE_EVENT", (data) => {
      //   io.in(data.room).emit("STOP_TYPING_MESSAGE_EVENT", data);
      // });

      // socket.on("SEND_MESSAGE_EVENT", (obj) => {
      //   io.emit("RECEIVE_MESSAGE_EVENT", obj);
      // });
    });

    console.log("Setting up socket");
    res.end();
  } else {
    console.log("Already set up");
    res.end();
    return;
  }
}
