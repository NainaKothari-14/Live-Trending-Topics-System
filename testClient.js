import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("🟢 Connected to server");

  // Simulate a LIKE click
  socket.emit("topic_action", {
    topic: "#Tech",//topic
    action: "LIKE"//like action
  });
});

socket.on("counter_update", (data) => {  //listen for counter updates
  console.log("🔥 Live update received:", data);
});
