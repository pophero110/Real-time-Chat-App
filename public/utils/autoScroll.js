

 const autoScroll = ($messages) => {
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
  const scrollOffset = $messages.scrollTop + visableHeight + 1;

  if (contentHeight - newMessasgeHeight <= scrollOffset) {
    $messages.scrollTop = contentHeight;
  }
};

export default autoScroll