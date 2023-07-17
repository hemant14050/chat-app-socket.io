const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const {setUserData, getUserData, getUserAllData, deleteUserData} = require("./data/usersData.js");
const fs = require("fs");
const PORT = 3000;

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
    if(data.selectedUser === "Everyone") {
      io.emit("chat-message", data);
    } else {
      socket.emit("chat-message", data);
      getUserData(data.selectedUser)?.emit("chat-message", data);
    }
  });

  socket.on("image-message", (data) => {
    if(data.selectedUser == "Everyone") {
      io.emit("image-message", data);
    } else {
      // fs.writeFileSync("image1.png", data.image);
      socket.emit("image-message", data);
      getUserData(data.selectedUser)?.emit("image-message", data);
    }
  });
  
});


server.listen(PORT, () => {
  console.log(`Started server at port:${PORT}`);
});
