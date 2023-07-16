const socket = io();
const connectedUsersDropDown = document.getElementById("connected-usersDropDown");
const chatForm = document.getElementById("form");
const chatContainer = document.getElementById("chat-container");
const mainChatContainer = document.querySelector(".main-chat-container");

const userName = prompt("What is your name?");
if(userName === null || userName === "") {
    alert("You must enter a name!");
    window.location.reload();
} else {
    socket.emit("new-user", userName);
    socket.on("user-exists", (userName) => {
        alert("User " + userName + " already exists!");
        window.location.reload();
    });
}

socket.on("user-connected", (connectedUsers, username) => {
    connectedUsersDropDown.innerHTML = "";
    let option = document.createElement("option");
    option.text = "Everyone";
    connectedUsersDropDown.add(option);
    connectedUsers.forEach((user) => {
        if(user !== userName) {
            let option = document.createElement("option");
            option.text = user;
            connectedUsersDropDown.add(option);
        }
    });
    chatContainer.innerHTML += `<p class="someone-joined"><span class="username-jjll">${userName === username? "You":username }</span> Joined chat!</p>`;
});

socket.on("user-disconnected", (username) => {
    for(let i = 0; i < connectedUsersDropDown.length; i++) {
        if(connectedUsersDropDown.options[i].text === username) {
            connectedUsersDropDown.remove(i);
        }
    }
    chatContainer.innerHTML += `<p class="someone-joined"><span class="username-jjll">${userName === username? "You":username }</span> Leaved chat!</p>`;
});

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = document.getElementById("message-input").value;
    const selectedUser = connectedUsersDropDown.value;
    if(selectedUser === "Everyone") {
        socket.emit("chat-message", {message: message, userName: userName});
    } else {
        socket.emit("private-chat-message", {message: message, userName: userName, selectedUser: selectedUser});
    }
    document.getElementById("message-input").value = "";
});

socket.on("chat-message", (data) => {
    const span = document.createElement("span");
    span.className = data.userName === userName? "send-msg":"receive-msg";
    span.innerHTML = data.userName === userName? "<p class='from-msg'>You</p>\n":`<p class='from-msg'>From: ${data.userName}</p>\n`;
    span.innerHTML += data.message;
    span.innerHTML += `<p class="whom-msg">To Everyone</p>`;
    chatContainer.appendChild(span);
    // chatContainer.scrollTop = chatContainer.scrollHeight;
    mainChatContainer.scrollTop = mainChatContainer.scrollHeight;
});

socket.on("private-chat-message", (data) => {
    const span = document.createElement("span");
    span.className = data.userName === userName? "send-msg":"receive-msg";
    span.innerHTML = data.userName === userName? "<p class='from-msg'>You</p>\n":`<p class='from-msg'>From: ${data.userName}</p>\n`;
    span.innerHTML += data.message;
    if(data.userName === userName) {
        span.innerHTML += `<p class="whom-msg">To ${data.selectedUser}</p>`;
    } else {
        span.innerHTML += `<p class="whom-msg">To Private</p>`;
    }
    chatContainer.appendChild(span);
    // chatContainer.scrollTop = chatContainer.scrollHeight;
    mainChatContainer.scrollTop = mainChatContainer.scrollHeight;
});
