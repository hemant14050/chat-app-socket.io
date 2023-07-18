const socket = io();
const connectedUsersDropDown = document.getElementById("connected-usersDropDown");
const chatForm = document.getElementById("form");
const chatContainer = document.getElementById("chat-container");
const mainChatContainer = document.querySelector(".main-chat-container");
const onlineCounter = document.querySelector(".online-count");
const imageInput = document.getElementById("imageIP");
const messageInput = document.getElementById("message-input");

const userName = prompt("What is your name?");
if(userName === null || userName === "" || userName.trim().length === 0) {
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
    onlineCounter.innerHTML = connectedUsers.length;
    chatContainer.innerHTML += `<p class="someone-joined"><span class="username-jjll">${userName === username? "You":username }</span> Joined chat!</p>`;
});

socket.on("user-disconnected", (username) => {
    for(let i = 0; i < connectedUsersDropDown.length; i++) {
        if(connectedUsersDropDown.options[i].text === username) {
            connectedUsersDropDown.remove(i);
        }
    }
    onlineCounter.innerHTML = connectedUsersDropDown.length;
    chatContainer.innerHTML += `<p class="someone-joined"><span class="username-jjll">${userName === username? "You":username }</span> Left chat!</p>`;
});

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const selectedUser = connectedUsersDropDown.value;
    socket.emit("chat-message", {message: message, userName: userName, selectedUser: selectedUser});
    messageInput.value = "";
});

socket.on("chat-message", (data) => {
    const span = document.createElement("span");
    span.className = data.userName === userName? "send-msg":"receive-msg";
    span.innerHTML = data.userName === userName? "<p class='from-msg'>You</p>\n":`<p class='from-msg'>From: ${data.userName}</p>\n`;
    span.innerHTML += data.message;
    if(data.userName === userName) {
        span.innerHTML += `<p class="whom-msg">To ${data.selectedUser}</p>`;
    } else {
        span.innerHTML += `<p class="whom-msg">To ${data.selectedUser === "Everyone"? "Everyone":"Private"}</p>`;
    }
    chatContainer.appendChild(span);
    // chatContainer.scrollTop = chatContainer.scrollHeight;
    mainChatContainer.scrollTop = mainChatContainer.scrollHeight;
});

imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        const selectedUser = connectedUsersDropDown.value;
        socket.emit("image-message", {image: reader.result, userName: userName, selectedUser: selectedUser});
    }
});

socket.on("image-message", (data) => {
    const span = document.createElement("span");
    span.className = data.userName === userName? "send-msg-image":"receive-msg-image";
    span.innerHTML = data.userName === userName? "<p class='from-msg'>You</p>\n":`<p class='from-msg'>From: ${data.userName}</p>\n`;
    span.innerHTML += `<img src="${data.image}" class="chat-image">`;
    if(data.userName === userName) {
        span.innerHTML += `<p class="whom-msg">To ${data.selectedUser}</p>`;
    } else {
        span.innerHTML += `<p class="whom-msg">To ${data.selectedUser === "Everyone"? "Everyone":"Private"}</p>`;
    }
    chatContainer.appendChild(span);
    setTimeout(() => {
        mainChatContainer.scrollTop = mainChatContainer.scrollHeight;
    }, 300);
});
