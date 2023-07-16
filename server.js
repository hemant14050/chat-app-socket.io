const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const {setUserData, getUserData, getUserAllData, deleteUserData} = require("./data/usersData.js");
const fs = require("fs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/script.js", (req, res) => {
  res.sendFile(__dirname + "/public/script.js");
});

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname + "/public/style.css");
});

io.on("connection", (socket) => {

  socket.on("new-user", (userName) => {    
    if(getUserData(userName) !== undefined) {
      socket.emit("user-exists", userName);
      return;
    }
    setUserData(userName, socket);
    console.log("User connected!");
    io.emit("user-connected", Object.keys(getUserAllData()), userName);

    socket.on("disconnect", () => {
      console.log("User disconnected!");
      deleteUserData(userName);
      io.emit("user-disconnected", userName);
    });
  });

  socket.on("chat-message", (data) => {
    io.emit("chat-message", data);
  });

  socket.on("private-chat-message", (data) => {
    socket.emit("private-chat-message", data);
    getUserData(data.selectedUser)?.emit("private-chat-message", data);
  });

  socket.on("image-message", (data) => {
    // fs.writeFileSync("image.png", data.image);
    io.emit("image-message", data);
  });

  socket.on("private-image-message", (data) => {
    // fs.writeFileSync("image1.png", data.image);
    socket.emit("private-image-message", data);
    getUserData(data.selectedUser)?.emit("private-image-message", data);
  });
  
});


server.listen(3000, () => {
  console.log("listening on *:3000");
});
