// declare web socket reference
let socket;

// let store = window.localStorage;
let store;

function showJoinDialog(event) {
    let user = store.getItem("user");
    if (user == null) {
        let join_chat_dialog = document.getElementById("join_chat_dialog");
        join_chat_dialog.showModal();
    }else{
        joinChat(user);
    }
}
function cancelJoinDialog(event) {
    let join_chat_dialog = document.getElementById("join_chat_dialog");
    join_chat_dialog.close();
}

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

function okJoinDialog(event) {
    event.preventDefault();
    let join_chat_dialog = document.getElementById("join_chat_dialog");
    let joi_form = document.getElementById("joi");
    let name_input = document.getElementById("name_input");
    let user = name_input.value;
    if (user == null || user.length == 0) {
        alert("Invalid name");
        return;
    }
    joi_form.reset();
    join_chat_dialog.close();
    store.setItem("user", user);
    joinChat(user);
}
function joinChat(user) {
    let url = "ws://localhost:8080/chat";
    // open socket
    socket = new WebSocket(url);

    socket.onopen = function(evt) {
        let message = {user: store.getItem("user")};
        socket.send(JSON.stringify(message));
    }

    //register function to handle messages received from server
    socket.onmessage = function (evt) {
        let message = JSON.parse(evt.data);
        //dynamically create new html item containing message text
        let chatElement = document.getElementById("chat");
        let messageElement = document.createElement("div");
        let textItem = document.createTextNode(message.user+": "+message.text);
        messageElement.appendChild(textItem);
        chatElement.appendChild(messageElement);
    };
    //register function to handle errors received from server
    socket.onerror = function (evt) {
        //display alert window
        alert(evt.data);
    };
    //register function to handle socket closure
    socket.onclose = function (eve) {
        //display alert window
        alert("Chat closed");
        
        //clear all messages from the chat
        let chatItem = document.getElementById("chat");
        while (chatItem.hasChildNodes()) {
            chatItem.removeChild(chatItem.lastChild);
        }
        //reset all buttons and fields
        document.getElementById("cht_join").disabled = false;
        document.getElementById("msg").disabled = true;
        document.getElementById("cht_send").disabled = true;
        document.getElementById("cht_leave").disabled = true;
        document.getElementById("msg").value = "";
    };
    
    // socket is now opened and callback functions are prepared
    
    //disable join button and enable other buttons and a message field
    document.getElementById("cht_join").disabled = true;
    document.getElementById("msg").disabled = false;
    document.getElementById("cht_send").disabled = false;
    document.getElementById("cht_leave").disabled = false;
}

// Get the message field value, send it to the server and reset the field
function sendMessage(event) {
    event.preventDefault();
    let cht_form = document.getElementById("cht");
    let value = document.getElementById("msg").value;
    cht_form.reset();
    let message = {text:value};
    socket.send(JSON.stringify(message));
}

//This function performs a normal socket closure
//Once Socket is closed, an onclose event handler function that was registered for this socket will reset the page and display the alert
function leaveChat(event) {
    socket.close(1000);
}

