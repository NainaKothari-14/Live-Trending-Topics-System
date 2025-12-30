import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import redis from "./redis.js";
import { producer } from "./kafka.js";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const TOPICS = ["#Tech", "#Sports", "#Music", "#Movies"];//Predefined topics

//Determine trending topic based on highest likes
async function emitTrending(io) {
  let topTopic = null;
  let maxLikes = -1;

  for (const topic of TOPICS) {
    const likes = await redis.get(`topic:${topic}:likes`); //Get like count from Redis
    const count = parseInt(likes || "0"); //Default to 0 if null

    if (count > maxLikes) {
      maxLikes = count; //Update max likes
      topTopic = topic;  //Update top topic
    }
  }

  if (topTopic) {
    io.emit("trending_update", topTopic); // Emit trending topic to all clients
  }
}

io.on("connection", (socket) => {
  console.log("🟢User connected");

  socket.on("topic_action", async ({ topic, action }, callback) => {
    try {
      //Invalid topic guard
      if (!TOPICS.includes(topic)) {
        return callback?.({ success: false, message: "Invalid topic" });
      }

      let likeCount;
      let viewCount;

      //VIEW (or implicit view when LIKE happens)
      if (action === "VIEW" || action === "LIKE") {
        viewCount = await redis.incr(`topic:${topic}:views`);

        io.emit("counter_update", {
          topic,
          action: "VIEW",
          count: viewCount
        });
      }

      //LIKE
      if (action === "LIKE") {
        likeCount = await redis.incr(`topic:${topic}:likes`);

        io.emit("counter_update", {
          topic,
          action: "LIKE",
          count: likeCount
        });

        //Update trending only on likes
        await emitTrending(io);
      }

      //Send event to Kafka (async log pipeline)
      await producer.send({
        topic: "topic_engagement_events",
        messages: [
          {
            value: JSON.stringify({
              topic,
              event: action === "LIKE" ? "TOPIC_LIKED" : "TOPIC_VIEWED",
              timestamp: new Date().toISOString()
            })
          }
        ]
      });

      //Acknowledgement to frontend
      callback?.({
        success: true,
        topic,
        action
      });

    } catch (error) {
      console.error("🚩Error handling topic action:", error);

      //Failure response
      callback?.({
        success: false,
        message: "Server error"
      });
    }
  });

  socket.on("🔴disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("🥳Backend running on port 5000");
});
