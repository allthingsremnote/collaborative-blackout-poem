var socket = io();
codeDisplay.innerText = location.pathname.split("/")[2];
socket.emit('event', { msg: "newUser", 'data': {}, "id": location.pathname.split("/")[2] });
var drawingCanvas = document.getElementById("drawingCanvas");


var drawingCtx = drawingCanvas.getContext("2d");
var textCtx = textCanvas.getContext("2d");
var hiddenDrawingCtx = hiddenDrawingCanvas.getContext("2d");
var downloadCtx = downloadCanvas.getContext("2d");
var fontSize = 20;
var scaleAmount = 1;
var mode = "pen";
var userColor;
var userCount;
eraser.onclick = function () {
    mode = "eraser";
    pen.classList.remove("buttonSelected");
    eraser.classList.add("buttonSelected");
    localStorage.setItem("currentTool", "eraser");
}
pen.onclick = function () {
    mode = "pen"
    pen.classList.add("buttonSelected");
    eraser.classList.remove("buttonSelected");
    localStorage.setItem("currentTool", "pen");
}
if (localStorage.getItem("currentTool")) {
    document.getElementById(localStorage.getItem("currentTool")).click();
}
socket.on('event', function (msg, callback) {
    console.log(msg);
    if (msg.msg == "joinedClosedRoom") {
        location.replace("/");
    }
    if (msg.msg == "newLine") {
        drawLine(msg.data);
    }
    if (msg.msg == "loadData") {
        document.fonts.load(`${fontSize}px Poppins`).then(function (fontFaceSetEvent) {
            userCount = msg.data.usersConnected;
            textCtx.font = fontSize + "px Poppins";

            var lines = getLines(textCtx, msg.data.text, msg.data.width - 100);

            textCanvas.height = (lines.length) * (fontSize + 10) * scaleAmount + 100 * scaleAmount;
            textCanvas.style.height = (lines.length) * (fontSize + 10) * scaleAmount + 100 * scaleAmount + "px";
            drawingCanvas.width = msg.data.width;
            drawingCanvas.height = textCanvas.height;
            drawingCanvas.style.width = msg.data.width + "px";
            drawingCanvas.style.height = textCanvas.style.height;
            hiddenDrawingCanvas.width = msg.data.width;
            hiddenDrawingCanvas.height = textCanvas.height;
            hiddenDrawingCanvas.style.width = msg.data.width + "px";
            hiddenDrawingCanvas.style.height = textCanvas.style.height;
            textCanvas.width = msg.data.width;
            textCanvas.style.width = msg.data.width + "px";

            while (textCanvas.getBoundingClientRect().width + 50 > window.innerWidth) {
                scaleAmount -= .01;
                textCanvas.style.transform = `scale(${scaleAmount})`;
            }
            drawingCanvas.style.transform = `scale(${scaleAmount})`;
            hiddenDrawingCanvas.style.transform = `scale(${scaleAmount})`;
            // paperBackground.style.left = 15 * scaleAmount + "px";
            paperBackground.style.top = 30 * scaleAmount + "px";
            var img = new Image();
            img.onload = function () {
                drawingCtx.globalAlpha = drawingOpacity;
                drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                hiddenDrawingCtx.drawImage(img, 0, 0);
                saveFromHidden();
            }
            img.src = msg.data.dataURL;


            textCtx.font = fontSize + "px Poppins";
            // textCanvas.height = lines.length * (fontSize + 5) + (paperBackground.getBoundingClientRect().top / scaleAmount) + 100;
            lines.forEach(function (line, index) {
                textCtx.fillText(line, 50, index * (fontSize + 10) + (paperBackground.getBoundingClientRect().top / scaleAmount));
            });
            paperBackground.style.height = `${(lines.length) * (fontSize + 10) * scaleAmount + 20 * scaleAmount}px`;
            paperBackground.style.width = msg.data.width * scaleAmount + "px";

            drawingCanvas.style.left = paperBackground.getBoundingClientRect().left + "px";
            drawingCanvas.style.top = paperBackground.getBoundingClientRect().top + "px";
            hiddenDrawingCanvas.style.left = paperBackground.getBoundingClientRect().left + "px";
            hiddenDrawingCanvas.style.top = paperBackground.getBoundingClientRect().top + "px";
            textCanvas.style.left = paperBackground.getBoundingClientRect().left + "px";
            textCanvas.style.top = paperBackground.getBoundingClientRect().top + "px";
            userColor = msg.data.userColor;
            setMarkerSize();
        })
    }
    if (msg.msg == "userJoined") {
        userCount++;
    }
    if (msg.msg == "userLeft") {
        userCount--;
    }
    if (msg.msg == "requestDataURL") {
        var response = { ok: true, data: { "dataURL": hiddenDrawingCanvas.toDataURL() } }
        console.log(response);
        callback(response);
    }
    if (msg.msg == "newChat") {
        console.log(msg);
        if (!chatOpen) {
            chatButton.classList.add("shake");
            setTimeout(function () {
                chatButton.classList.remove("shake");
            }, 500);
        }
        renderNewChat(msg.data.msg, msg.data.color);
    }
});
var currentMousePosition = { x: 0, y: 0 };
var radius = 5;
var mouseDown = false;
var previousCall = new Date().getTime();
var callLimit = 20;
var drawingOpacity = .8;
var markerBorderWidth = 0;
drawMarker.style.borderWidth = markerBorderWidth + "px";
document.onmousemove = mouseMove;
function mouseMove(e) {
    if (chatOpen) { chatInput.focus() };
    drawMarker.style.left = e.clientX - radius * scaleAmount / 2 - markerBorderWidth + "px";
    drawMarker.style.top = e.clientY - radius * scaleAmount / 2 - markerBorderWidth + "px";
    var eX = e.clientX - drawingCanvas.offsetLeft;
    var eY = e.clientY - drawingCanvas.offsetTop + document.documentElement.scrollTop;
    if (new Date().getTime() - previousCall > callLimit) {
        previousCall = new Date().getTime();
        //Only draw if the mouse is down
        if (mouseDown) {
            var lineData = { color: userColor, original: true, mode: mode, x: eX / scaleAmount, y: eY / scaleAmount, px: currentMousePosition.x * 1, py: currentMousePosition.y * 1, r: radius };
            drawLine(lineData);
            console.log(lineData);
            lineData.original = false;
            socket.emit('event', { msg: "newLine", 'data': lineData, "id": location.pathname.split("/")[2] });
        } else { setCurrentPosition(eX / scaleAmount, eY / scaleAmount); }
    }
};
function fontawesomeLoaded() {
    setTimeout(function () {
        options.style.opacity = "1";
        options.style.transform = "unset";
        codeDisplay.style.opacity = "1";
        codeDisplay.style.transform = "unset";
    }, 100);
}
radiusRange.oninput = function () {
    localStorage.setItem("radius", radiusRange.value);
    radius = radiusRange.value;
    setMarkerSize();
}
if (localStorage.getItem("radius")) {
    radius = localStorage.getItem("radius");
    radiusRange.value = radius;
    setMarkerSize();
}

function setMarkerSize() {
    drawMarker.style.width = radius * scaleAmount + "px";
    drawMarker.style.height = radius * scaleAmount + "px";
}


drawingCanvas.onmousedown = function () { mouseDown = true; }
document.onmouseup = function () { mouseDown = false; }
function drawLine(line) {
    if (line.mode == "eraser") {
        hiddenDrawingCtx.globalCompositeOperation = "destination-out";
    } else {
        hiddenDrawingCtx.globalCompositeOperation = "source-over";
    }
    hiddenDrawingCtx.beginPath();
    hiddenDrawingCtx.lineWidth = line.r || radius;
    hiddenDrawingCtx.lineCap = "round";
    hiddenDrawingCtx.strokeStyle = line.color;
    hiddenDrawingCtx.moveTo(line.px, line.py);
    if (line.original) {
        setCurrentPosition(line.x, line.y);
    }
    hiddenDrawingCtx.lineTo(line.x, line.y);
    hiddenDrawingCtx.stroke();

    cleanUpStrayMarks();
    saveFromHidden();
}
function saveFromHidden() {
    drawingCtx.globalAlpha = drawingOpacity;
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawingCtx.drawImage(hiddenDrawingCanvas, 0, 0);
}
function cleanUpStrayMarks() {
    //Clean below paper
    hiddenDrawingCtx.clearRect(0, (paperBackground.getBoundingClientRect().bottom + document.documentElement.scrollTop) / scaleAmount - 30, drawingCanvas.width, drawingCanvas.height);
    saveFromHidden();
}
function setCurrentPosition(x, y) {
    currentMousePosition.x =
        x;
    currentMousePosition.y =
        y;
}

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function downloadPoem() {
    downloadCanvas.width = paperBackground.getBoundingClientRect().width / scaleAmount;
    downloadCanvas.height = paperBackground.getBoundingClientRect().height / scaleAmount;
    downloadCtx.fillStyle = "white";
    downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    var oldOpac = drawingOpacity;
    drawingOpacity = 1;
    saveFromHidden();
    drawingOpacity = oldOpac;
    downloadCtx.drawImage(
        drawingCanvas,
        0, 0,
        paperBackground.getBoundingClientRect().width / scaleAmount, paperBackground.getBoundingClientRect().height / scaleAmount,
        0, 0,
        paperBackground.getBoundingClientRect().width / scaleAmount, paperBackground.getBoundingClientRect().height / scaleAmount
    );


    var imageData = downloadCtx.getImageData(0, 0, downloadCanvas.width, downloadCanvas.height);
    console.log(imageData)
    // examine every pixel, 
    for (var i = 0; i < imageData.data.length; i += 4) {
        //check if its not white
        if (
            imageData.data[i] != 255
        ) {
            //change to black
            imageData.data[i] = 0;
            imageData.data[i + 1] = 0;
            imageData.data[i + 2] = 0;
            // imageData.data[i + 3] = 0;
        }
    }
    downloadCtx.putImageData(imageData, 0, 0);

    downloadCtx.drawImage(
        textCanvas,
        0, 0,
        paperBackground.getBoundingClientRect().width / scaleAmount, paperBackground.getBoundingClientRect().height / scaleAmount,
        0, 0,
        paperBackground.getBoundingClientRect().width / scaleAmount, paperBackground.getBoundingClientRect().height / scaleAmount
    );

    var download = document.createElement('a');
    download.href = downloadCanvas.toDataURL();
    download.download = 'myBlackOutPoem.png';
    download.click();
    saveFromHidden();
}
downloadButton.onclick = function () {
    downloadPoem();
};

var chatOpen = false;
var sendingChat = false;
document.onkeydown = function (e) {
    console.log(e);
    if (e.key == "Enter") {
        sendChat.click();
    }
}
sendChat.onclick = function () {
    if (sendingChat || chatInput.value == "") { return }
    sendPlane.style.transform = "translate(10px,-25px) rotate(-20deg)";
    sendPlane.style.opacity = "0";
    sendingChat = true;
    setTimeout(function () {
        sendPlane.style.transform = "translate(-60%, -45%)";
        chatInput.style.color = "white";
        setTimeout(function () {
            sendPlane.style.opacity = "1";
            chatInput.style.color = "#191919";
            sendingChat = false;
        }, 200);
        socket.emit('event', { msg: "newChat", 'data': { msg: chatInput.value, color: userColor }, "id": location.pathname.split("/")[2] });
        renderNewChat(chatInput.value, userColor);
        chatInput.value = "";
    }, 150);
}
chatButton.onclick = function () {
    chatContainer.style.display = "block";
    setTimeout(function () {
        chatContainer.style.opacity = '1';
        chatOpen = true;
        setTimeout(function () {

        }, 100);
    }, 10);
}
chatClose.onclick = function () {
    chatContainer.style.opacity = '0';
    setTimeout(function () {
        chatOpen = false;
        chatContainer.style.display = "none";
    }, 100);
}
function renderNewChat(msg, user) {
    var tr = document.createElement("tr");
    var userText = document.createElement("td");
    userText.innerText = "";
    tr.append(userText);
    var picture = document.createElement("div");
    picture.classList.add("chatPicture");
    picture.style.background = user;
    userText.appendChild(picture);
    var userMsg = document.createElement("td");
    userMsg.innerText = msg;
    tr.append(userMsg);
    chatTable.append(tr);
    chatTable.scrollBy(0, tr.getBoundingClientRect().height);
}

function leavingSite() {
    // document.body.style.background = "red";
    // return "please no"
}
// document.onbeforeunload = function (e) {
    // if (userCount == 1) {
        // return "yes";
    // }
// }