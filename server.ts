import config from "config";
import logger from "./src/config/logger";
import { createMessageBroker } from "./src/factories/broker-factory";
import webSocket from "./src/socket";
import { MessageBroker } from "./src/types/broker";

const startServer = async () => {
  let broker: MessageBroker | null = null;
  try {
    const PORT = config.get("server.port");
    broker = createMessageBroker();
    await broker.connectConsumer();
    await broker.consumeMessage(["order"], false);
    webSocket.webSocketServer
      .listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
      })
      .on("error", (error) => {
        console.log("error", error.message);
        process.exit(1);
      });
  } catch (err) {
    logger.error("Error happened: ", err.message);
    if (broker) {
      await broker.disconnectConsumer();
    }
    process.exit(1);
  }
};

void startServer();
