const socket = io();

// DOM Elements
const usernameInputScreen = document.getElementById("usernameInputScreen");
const joinBtn = document.getElementById("joinBtn");
const chatScreen = document.getElementById("chatScreen");
const profileName = document.getElementById("profileName");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const userList = document.getElementById("userList");
const commonMessages = document.getElementById("commonMessages");
const privateMessages = document.getElementById("privateMessages");
const notificationContainer = document.getElementById("notificationContainer");

// Current recipient for private messages
let currentRecipient = "";

// Set up the username
joinBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  if (username) {
    socket.emit("setUsername", username);
    profileName.textContent = username; // Display only the username in bold and italic
    usernameInputScreen.style.display = "none";
    chatScreen.style.display = "flex";
  } else {
    alert("Please enter a username.");
  }
});

// Sending a message
sendBtn.addEventListener("click", () => {
  const msg = messageInput.value.trim();

  if (msg) {
    if (currentRecipient) {
      // Sending a private message
      socket.emit("privateMessage", { recipient: currentRecipient, msg });
      privateMessages.innerHTML += `<div><strong>You to ${currentRecipient}:</strong> ${msg}</div>`;
    } else {
      // Sending a common room message
      socket.emit("commonMessage", msg);
      commonMessages.innerHTML += `<div><strong>You:</strong> ${msg}</div>`;
    }
    messageInput.value = "";
  } else {
    alert("Please type a message.");
  }
});

// Function to show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerText = message;

  notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000); // Notification disappears after 3 seconds
}

// Receiving the updated user list
socket.on("userList", (usernames) => {
  userList.innerHTML = "";
  usernames.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.className = "userItem";
    userItem.textContent = user;

    // Setting up private messaging when a user is clicked
    userItem.addEventListener("click", () => {
      currentRecipient = user;
      alert(`You are now chatting with ${user}`);
    });

    userList.appendChild(userItem);
  });
});

// Receiving a common message
socket.on("commonMessage", ({ user, msg }) => {
  commonMessages.innerHTML += `<div><strong>${user}:</strong> ${msg}</div>`;
  
  // Show notification for new common message
  showNotification(`New message from ${user} in Common Room`);
});

// Receiving a private message
socket.on("privateMessage", ({ from, msg }) => {
  privateMessages.innerHTML += `<div><strong>${from}:</strong> ${msg}</div>`;
  
  // Show notification for new private message
  showNotification(`New private message from ${from}`);
});

// Tab switching function
function openTab(tabName) {
  const tabs = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].style.display = "none";
  }
  document.getElementById(tabName).style.display = "block";
}

// Default to show the common messages tab
document.getElementById("commonMessages").style.display = "block";
