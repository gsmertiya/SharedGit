// declare web socket and session store references
let socket;
let store;
window.addEventListener("load", (event) => {
    store = window.sessionStorage;
    let cht_join = document.getElementById("cht_join");
    let cht_send = document.getElementById("cht_send");
    let cht_leave = document.getElementById("cht_leave");
    let joi_ok = document.getElementById("joi_ok");
    let joi_cancel = document.getElementById("joi_cancel");
    cht_join.addEventListener("click", showJoinDialog);
    cht_send.addEventListener("click", sendMessage);
    cht_leave.addEventListener("click", leaveChat);
    joi_ok.addEventListener("click", okJoinDialog);
    joi_cancel.addEventListener("click",cancelJoinDialog);
});
function showJoinDialog(event) {
    // attempt to acquire user from the session store
    // display join chat dialog if the user is null
    // otherwise proceed to join the chat with that username
}
function cancelJoinDialog(event) {
    let join_chat_dialog = document.getElementById("join_chat_dialog");
    join_chat_dialog.close();
}
function okJoinDialog(event) {
    // Prevent default action.
    // Acquire join dialog, join form, name input elements.
    // Validate the name input value, by checking if it exists and its length is not zero.
    // Display an alert and return if name is invalid.
    // If name is valid:
    // - Reset the form.
    // - Close the chat dialog.
    // - Save the name into a session store.
    // - Invoke joinChat function passing name as an argument.
}
function joinChat(user) {
    // Declare a URL that point to the chat server.
    // Open a socket with this URL.
    // Register onopen socket event handler, which should:
    // - Create a new message object containing a user property.
    // - User property value should be picked up from the store object.
    // - Convert message object to JSON and send it to the socket.
    // Register onmessage socket event handler, which should:
    // - Parse event data as a JSON message.
    // - Acquire "chat" element from the document.
    // - Dynamically create new html item containing message text.
    // - Append this item to the "chat" element of the page.
    // Register onerror socket event handler, which should:
    // - Display an alert containing the error.
    // Register onclose socket event handler, which should:
    // - Display an alert stating that chat is now closed.
    // - Clear all messages displayed "chat" element.
    // - Reset all buttons and fields to their original state.
    // Socket is now opened and callback functions are prepared.
    // Disable the join button and enable all other buttons and a message field.
}
function sendMessage(event) {
    // Prevent default action.
    // Acquire chat form, and message field value from the document
    // Reset the form.
    // Create a new message object containing text property.
    // Assign the message field value to the text property.
    // Convert message object to JSON and send it to the socket.
}
function leaveChat(event) {
  // Perform a normal socket closure.
}

