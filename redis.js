import { createClient } from "redis";

const redis = createClient({        //to connect to redis server
  url: "redis://localhost:6379"
});

redis.on("error", (err) => console.error("Redis error", err)); //error handling
redis.on("connect", () => console.log("✅ Redis connected")); //successful connection message

await redis.connect(); //establish connection

export default redis;
