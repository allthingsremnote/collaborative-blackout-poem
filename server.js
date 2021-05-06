var express = require('express');
const bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.get('/join/:id', (req, res) => {
    console.log(req.params.id);
    if (lines.get(req.params.id) == undefined) {
        res.redirect("/")
    } else {
        res.sendFile(__dirname + '/public/join.html');
    }
});
app.post('/createPoem', (req, res) => {
    var id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    lines.set(id, { "id": id, "text": req.body.text, "width": req.body.screenWidth, "height": req.body.screenHeight });
    console.log(req.body);
    res.send(JSON.stringify({ "id": id }));
})
var lines = new Map();
io.on('connection', (socket) => {
    socket.on('event', function (msg) {
        if (msg.msg == "newLine") {
            socket.to(msg.id).broadcast.emit('event', { msg: "newLine", 'data': msg.data });
        }
        if (msg.msg == "newUser") {
            socket.join(msg.id);

            //Get the first user, pull their canvas and send to new user
            var firstSocket = ([...io.of("/").sockets].map(function (x) { return x[1] }).filter(function (x) { return x.rooms.has(msg.id) }))[0]
            //ask for data url
            firstSocket.emit('event', { msg: "requestDataURL", "data": {} }, function (a) {
                var usersColor = randomColor();
                //send data url to new user 
                socket.emit('event', { msg: "loadData", "data": { "usersConnected": ([...io.of("/").sockets].map(function (x) { return x[1] }).filter(function (x) { return x.rooms.has(msg.id) })).length, "userColor": usersColor, "dataURL": a.data.dataURL, "text": lines.get(msg.id).text, "width": lines.get(msg.id).width, "height": lines.get(msg.id).height } });
                socket.to(msg.id).broadcast.emit('event', { msg: "userJoined" });

            });
        }
        if (msg.msg == "newChat") {
            socket.to(msg.id).broadcast.emit('event', msg);
        }

    });
    socket.on('disconnecting', function () {
        socket.to([...socket.rooms][1]).broadcast.emit('event', { msg: "userLeft" });
    });
});


var colorMin = 50;
var colorDif = 50;
function randomColor() {
    return "#" + Math.round(Math.random() * colorDif + colorMin) + Math.round(Math.random() * colorDif + colorMin) + Math.round(Math.random() * colorDif + colorMin);
}
http.listen(80, () => {
    console.log('listening on *:8080');
});
return