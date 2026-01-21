import config from "config";
import { createServer } from "node:http";
import { Server } from "socket.io";

const webSocketServer = createServer();

// todo: move origin value to the config

const ALLOWED_DOMAINS = [
  config.get("frontend.clientUI"),
  config.get("frontend.adminUI"),
];

const io = new Server(webSocketServer, {
  cors: {
    origin: ALLOWED_DOMAINS as string[],
  },
});

io.on("connection", (socket) => {
  console.log("Client Connected", socket.id);
  socket.on("join", (data) => {
    socket.join(String(data.tenantId));
    socket.emit("join", { roomId: String(data.tenantId) });
  });
});

export default {
  webSocketServer,
  io,
};
