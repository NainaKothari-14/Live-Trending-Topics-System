import mongoose from "mongoose";

await mongoose.connect("mongodb://localhost:27017/trending");

console.log("✅ MongoDB connected");

const eventSchema = new mongoose.Schema({
  topic: String,
  event: String,
  timestamp: Date
});

export const Event = mongoose.model("Event", eventSchema);
