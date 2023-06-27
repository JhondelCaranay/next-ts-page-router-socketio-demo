import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@/types/socket-type";
import { Server, Socket } from "socket.io";

const typingUserHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) => {
  // Listen typing events
  socket.on("START_TYPING_MESSAGE_EVENT", (data) => {
    io.in(data.room).emit("START_TYPING_MESSAGE_EVENT", data);
  });
  socket.on("STOP_TYPING_MESSAGE_EVENT", (data) => {
    io.in(data.room).emit("STOP_TYPING_MESSAGE_EVENT", data);
  });
};

export default typingUserHandlers;
