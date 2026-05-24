const GRAPHQL_ENDPOINT = "https://6dt3vuzomzhn5egbb6u6co5owa.appsync-api.ap-south-1.amazonaws.com/graphql";

const API_KEY = "da2-z7grycm6i5eebojcdidjwo3cly";


async function fetchMessages() {

  const query = `
    query {
      getMessages {
        id
        username
        content
        createdAt
      }
    }
  `;

  try {

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();

    const chatBox = document.getElementById("chat-box");

    chatBox.innerHTML = "";

    // Sort newest first
    const messages = result.data.getMessages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    messages.forEach(msg => {

      const time = new Date(msg.createdAt).toLocaleTimeString();

      chatBox.innerHTML += `
        <div class="message">
          <strong>${msg.username}</strong>
          <span class="time">${time}</span>
          <p>${msg.content}</p>
        </div>
      `;
    });

    // Auto scroll bottom
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (error) {

    console.error("Fetch Error:", error);

  }
}


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

  const usernameInput = document.getElementById("username");
  const messageInput = document.getElementById("message");

  const username = usernameInput.value.trim();
  const content = messageInput.value.trim();

  // Validation
  if (!username || !content) {

    alert("Username and message are required");

    return;
  }

  const mutation = `
    mutation {
      sendMessage(
        id: "${Date.now()}",
        username: "${username}",
        content: "${content}",
        createdAt: "${new Date().toISOString()}"
      ) {
        id
      }
    }
  `;

  try {

    await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({ query: mutation })
    });

    messageInput.value = "";

    fetchMessages();

  } catch (error) {

    console.error("Send Error:", error);

    alert("Failed to send message");

  }
}


// ===============================
// ENTER KEY SUPPORT
// ===============================

document
  .getElementById("message")
  .addEventListener("keydown", function (e) {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      sendMessage();
    }
  });


// ===============================
// S3 FILE UPLOAD
// ===============================

AWS.config.update({
  accessKeyId: "AKIAWXEPNMD4SIPNM2AA",
  secretAccessKey: "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",
  region: "ap-south-1"
});

const s3 = new AWS.S3({
  params: {
    Bucket: "realtime-chat-app-prasanna"
  }
});

function uploadFile() {

  const file = document.getElementById("fileInput").files[0];

  if (!file) {

    alert("Please select a file");

    return;
  }

  const params = {
    Bucket: "realtime-chat-app-prasanna",
    Key: Date.now() + "-" + file.name,
    Body: file
  };

  s3.upload(params, function (err, data) {

    if (err) {

      console.error(err);

      alert("File upload failed");

    } else {

      alert("File uploaded successfully");

      console.log("File URL:", data.Location);

      // Optional:
      // auto send uploaded file link into chat

      document.getElementById("message").value =
        "Uploaded File: " + data.Location;
    }
  });
}


// ===============================
// INITIAL LOAD
// ===============================

fetchMessages();


// ===============================
// AUTO REFRESH EVERY 3 SECONDS
// ===============================

setInterval(fetchMessages, 3000);