const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const {setUserData, getUserData, getUserAllData, deleteUserData} = require("./data/usersData.js");

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
  console.log("User connected!");

  socket.on("new-user", (userName) => {    
    if(getUserData(userName) !== undefined) {
      socket.emit("user-exists", userName);
      return;
    }
    setUserData(userName, socket);
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
  
});


server.listen(3000, () => {
  console.log("listening on *:3000");
});
