//Agora vamos usar o socket de uma maneira muito semelhante à forma como ele foi usado no back-end:
const io = require('socket.io')
const socket = io()

socket.on("connect", function() {
    // Do stuff when we connect to the serve
    socket.emit('JOIN', { message: '' })
});

socket.on('ROOM_JOINED', function(data){
    console.log("Jogador %s registrado com sucesso!", socket.id);
    console.log(data);
});