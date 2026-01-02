const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

/**
 * Serve static files from /public
 */
app.use(express.static(path.join(__dirname, "public")));

/**
 * Serve index.html at /
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Socket.IO setup
 */
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket"], // REQUIRED for Codespaces
});

const GROUP = "general";
const users = new Map(); // socket.id -> username

console.log("🚀 Server starting...");

io.on("connection", (socket) => {
  console.log("🔥 SOCKET CONNECTED:", socket.id);

  socket.on("join", ({ username }) => {
    socket.username = username;
    socket.join(GROUP);
    users.set(socket.id, username);

    console.log(`✅ ${username} joined ${GROUP}`);

    io.to(GROUP).emit("system", {
      message: `${username} joined the chat`,
      count: users.size,
    });
  });

  socket.on("message", ({ message }) => {
    if (!socket.username) return;

    console.log(`💬 ${socket.username}: ${message}`);

    io.to(GROUP).emit("message", {
      sender: socket.username,
      message,
      count: users.size,
    });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`❌ ${socket.username} disconnected`);
      users.delete(socket.id);

      io.to(GROUP).emit("system", {
        message: `${socket.username} left the chat`,
        count: users.size,
      });
    }
  });
});

/**
 * IMPORTANT FOR CODESPACES
 */
server.listen(8080, "0.0.0.0", () => {
  console.log("✅ Server running on port 8080");
});
