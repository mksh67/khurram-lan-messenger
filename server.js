const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3011; // Changed port to 3011

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// User data structure
let users = [];

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle setting the username
  socket.on("setUsername", (username) => {
    socket.username = username;
    users.push(username);

    // Broadcast updated user list to all clients
    io.emit("userList", users);

    console.log(`${username} joined the chat.`);
  });

  // Handle common room messages
  socket.on("commonMessage", (msg) => {
    io.emit("commonMessage", { user: socket.username, msg });
    console.log(`Common message from ${socket.username}: ${msg}`);
  });

  // Handle private messages
  socket.on("privateMessage", ({ recipient, msg }) => {
    const recipientSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.username === recipient
    );
    if (recipientSocket) {
      recipientSocket.emit("privateMessage", { from: socket.username, msg });
      console.log(`Private message from ${socket.username} to ${recipient}: ${msg}`);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    if (socket.username) {
      users = users.filter((user) => user !== socket.username);

      // Update user list for all clients
      io.emit("userList", users);

      console.log(`${socket.username} disconnected.`);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
