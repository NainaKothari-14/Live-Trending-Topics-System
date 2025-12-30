import { Kafka } from "kafkajs";
import mongoose from "mongoose";
import { Client } from "@elastic/elasticsearch";

//Kafka Setup
const kafka = new Kafka({
  clientId: "trending-consumer",//Consumer client ID
  brokers: ["localhost:9092"]//Kafka broker address
});

const consumer = kafka.consumer({ groupId: "engagement-group" }); //Consumer group

//MongoDB
await mongoose.connect("mongodb://localhost:27017/trending");//Connect to MongoDB

//Define a schema and model for storing events

const eventSchema = new mongoose.Schema({
  topic: String,
  event: String,
  timestamp: Date
});

const Event = mongoose.model("Event", eventSchema);

console.log("✅ MongoDB connected");

//Elasticsearch
const esClient = new Client({
  node: "http://localhost:9200"
});

console.log("✅ Elasticsearch connected");

//Consumer Logic
await consumer.connect(); //Connect the consumer
await consumer.subscribe({ // Listen to the Kafka topic where like and view events are sent
  topic: "topic_engagement_events",
  fromBeginning: true
});

console.log("🟢 Kafka consumer running");

await consumer.run({
  eachMessage: async ({ message }) => {
    const data = JSON.parse(message.value.toString());//Parse the incoming message

    console.log("📥 Event received:", data);

    //Save to MongoDB
    await Event.create({
      topic: data.topic,
      event: data.event,
      timestamp: new Date(data.timestamp)
    });

    //Index in Elasticsearch
    await esClient.index({ 
      index: "topic_events",
      document: data
    });
  }
});
