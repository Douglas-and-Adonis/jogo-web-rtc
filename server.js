const express = require('express')
const { ClientRequest } = require('http')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

// cria uma rota para o arquivo index.html
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Lista de clientes
let clients = [];

// Escutando Eventos
io.sockets.on('connection', function(socket) {

    // Recebimento JOIN
    socket.on('JOIN', function(data) {

        // Printar o que foi recebido
        console.log(data);

        var clientId = socket.id;
        console.log("Received User Join" + clientId);
        
        var actualClients = JSON.stringify(clients)
        clients.push(clientId)

        // Respondendo ao usuario con a confirmação
        socket.emit('ROOM_JOINED', {some: "data"});
    });
});

const port = 3000
server.listen(port)