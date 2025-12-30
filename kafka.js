import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "trending-app",
  brokers: ["localhost:9092"]
});

export const producer = kafka.producer();

await producer.connect();
console.log("✔️Kafka producer connected");
//🔜//