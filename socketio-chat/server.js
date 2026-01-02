const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

console.log("🚀 Socket.IO chat server starting...");

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.userId = userId;
    socket.join(userId);
    console.log(`✅ User joined: ${userId}`);
  });

  socket.on("chat", ({ to, message }) => {
    io.to(to).emit("chat", {
      from: socket.userId,
      message,
      time: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.userId}`);
  });
});

httpServer.listen(8080,"0.0.0.0", () => {
  console.log("✅ Socket.IO server running on http://localhost:8080");
});
