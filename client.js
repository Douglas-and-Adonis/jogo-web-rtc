const io = require('socket.io')
const socket = io.connect("http://localhost:8000/");
//Agora vamos usar o socket de uma maneira muito semelhante à forma como ele foi usado no back-end:

socket.on("connect", function() {
    // Do stuff when we connect to the server
});

socket.on("some event", function(data) {
    // Log the data I received
    console.log(data);

    // Send a message to the server
    socket.emit("other event", {some: "data"});
});