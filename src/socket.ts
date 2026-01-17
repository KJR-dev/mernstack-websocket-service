import { createServer } from "node:http";
import { Server } from "socket.io";

const webSocketServer = createServer();

// todo: move origin value to the config
const io = new Server(webSocketServer, {
  cors: {
    origin: "http://localhost:5173",
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
