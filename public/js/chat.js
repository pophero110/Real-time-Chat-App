import autoScroll from "/utils/autoScroll.js";
const socket = io();

//elemenet
const $messageForm = document.querySelector("#form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $messages = document.querySelector("#messages");
const $sendLocationButton = document.querySelector("#send_location");
const $sidebar = document.querySelector("#sidebar");
//template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll($messages);
});
socket.on("locationMessage", (locationMessage) => {
  console.log(location);
  const html = Mustache.render(locationTemplate, {
    username: locationMessage.username,
    url: locationMessage.url,
    createdAt: moment(locationMessage.createdAt).format("h:mm A"),
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll($messages);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    //enable
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("message was delivered");
  });
});

$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    $sendLocationButton.removeAttribute("disabled");
    socket.emit(
      "sendLocaiton",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (error) => {
        console.log("location shared");
      }
    );
  });
});

