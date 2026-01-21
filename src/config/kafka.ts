import config from "config";
import { Consumer, EachMessagePayload, Kafka, KafkaConfig } from "kafkajs";
import socket from "../socket";
import { MessageBroker } from "../types/broker";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {
    let kafkaConfig: KafkaConfig = {
      clientId,
      brokers,
    };
    if (process.env.NODE_ENV === "production") {
      kafkaConfig = {
        ...kafkaConfig,
        ssl: true,
        connectionTimeout: 45000,
        sasl: {
          mechanism: "plain",
          username: config.get("kafka.sals.username"),
          password: config.get("kafka.sals.password"),
        },
      };
    }
    const kafka = new Kafka(kafkaConfig);

    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Disconnect the consumer
   */
  async disconnectConsumer() {
    await this.consumer.disconnect();
  }

  async consumeMessage(topics: string[], fromBeginning: boolean = false) {
    await this.consumer.subscribe({ topics, fromBeginning });

    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        // Logic to handle incoming messages.
        console.log({
          value: message.value.toString(),
          topic,
          partition,
        });
        switch (topic) {
          case "order": {
            // todo: maybe check event_type ?
            const order = JSON.parse(message.value.toString());
            socket.io.to(order.data.tenantId).emit("order-update", order);
            break;
          }

          default:
            console.log("Doing nothing");
            break;
        }
      },
    });
  }
}
