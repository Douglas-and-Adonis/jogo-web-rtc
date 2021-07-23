const express = require('express')
const { ClientRequest } = require('http')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use('/', express.static('public'))



// Now let's set up and start listening for events
io.sockets.on('connection', function(socket) {

    // We're connected to someone now. Let's listen for events from them
    socket.on('some event', function(data) {

        // We've received some data. Let's just log it
        console.log(data);

        // Now let's reply
        socket.emit('event', {some: "data"});
    });
});

io.sockets.on('connection', function(socket) {
    // We're connected to someone now. Let's listen for events from them
    socket.on('chat message', function(msg) {
        io.sockets.emit('message', msg);
    });
});

const port = process.env.PORT || 3000
server.listen(port)