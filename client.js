
const io = require('socket.io')
const socket = io()

socket.on("connect", function() {

    // Enviando mensagem inicial de conexão com o servidor
    socket.emit('JOIN', { message: '' })
});

socket.on('ROOM_JOINED', function(data){

    console.log("Conectado ao Servidor, nosso ID é %s", socket.id);
    console.log(data);
});