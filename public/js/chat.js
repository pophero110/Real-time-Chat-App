const socket = io();

// socket.on('countUpdate', (count) => {
//     console.log('the count has been updated', count)
// })

//elemenet
const $messageForm = document.querySelector("#form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $messages = document.querySelector("#messages");
const $sendLocationButton = document.querySelector("#send_location");
const $locaitonLink = document.querySelector("a");
const $sidebar = document.querySelector("#sidebar");
//template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
//Option
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessasgeHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visable height
  const visableHeight = $messages.offsetHeight;

  //Height of messages content, also the height of scrollbar
  const contentHeight = $messages.scrollHeight;

  //How far have I scrolled? or the scrollBottom
  //+1 for mathfloor
  const scrollOffset = $messages.scrollTop + visableHeight + 1

  if (contentHeight - newMessasgeHeight <= scrollOffset) {
    $messages.scrollTop = contentHeight;
    console.log("scrolled", $messages.scrollTop, contentHeight);
  } else {
    console.log("not scrolled", contentHeight, newMessasgeHeight, scrollOffset);
  }
  
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});
socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: location.url,
    createdAt: moment(location.createdAt).format("h:mm A"),
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
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

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
