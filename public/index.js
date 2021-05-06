var createPoem = document.getElementById("createPoem");
var textInput = document.getElementById("textInput");

textInput.value = `Dogs were probably the first tame animals. They have accompanied humans for at least 20,000 years and possibly as many as 40,000. Scientists generally agree that all dogs, domestic and wild, share a common wolf ancestor; at some point grey wolves and dogs went on their separate evolutionary ways.

Dog Breeds

Today humans have bred hundreds of different domestic dog breeds—some of which could never survive in the wild. Despite their many shapes and sizes all domestic dogs, from Newfoundlands to pugs, are members of the same species—Canis familiaris. Although they have domestic temperaments, dogs are related to wolves, foxes, and jackals.`
// textInput.value = "";


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
        alert("no room found dumby");
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

