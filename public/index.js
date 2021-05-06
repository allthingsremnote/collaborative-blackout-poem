var createPoem = document.getElementById("createPoem");
var textInput = document.getElementById("textInput");

textInput.value = "";


createPoem.onclick = async function () {
    var poem = await fetch("/createPoem", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "text": textInput.value,
            "screenWidth": window.innerWidth,
            "screenHeight": window.innerHeight,
        })
    });
    poem = await poem.json();
    console.log(poem);
    location.replace(`${location.href}join/${poem.id}`);
}
joinRoom.onclick = async function () {
    var room = await fetch(`${location.href}join/${codeInput.value}`);
    room = await room.text();
    if (room == "404") {
        codeInput.style.border = "red solid 3px";
        setTimeout(function () {
            codeInput.style.border = "red solid 0px";
        }, 100);
    } else {
        location.replace(`${location.href}join/${codeInput.value}`);
    }
}

createModeButton.onclick = function () {
    createModeButton.style.display = "none";
    createCont.style.display = "block";
}


var offsetCount = 0;
// setInterval(function () {
    // offsetCount += 2;
    // backAnimationPath.style.strokeDashoffset = offsetCount + "px";
// }, 10);

// createPoem.click();

// var scribbleCanvas = document.getElementById("canvas");
// var scribbleCtx = canvas.getContext("2d");
// scribbleCanvas.style.width = window.innerWidth + "px";
// scribbleCanvas.style.height = window.innerHeight + "px";
// scribbleCanvas.width = window.innerWidth;
// scribbleCanvas.height = window.innerHeight;

