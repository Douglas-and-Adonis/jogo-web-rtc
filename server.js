const express = require('express');
const path = require('path');
const { ClientRequest } = require('http');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// cria uma rota para o arquivo index.html
//app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Lista de clientes
var players = [];

// Escutando Eventos
io.sockets.on('connection', function(socket) {

    // Recebimento JOIN
    socket.on('JOIN', (loginDetails) =>  {
        console.log(`Received Message 'JOIN' from user:  ${loginDetails.name}`);
        console.log(players)
        if (players[0] == null) {
          console.log(`Criando sala ${loginDetails.roomId}, emitido 'ROOM_CREATED to user' ${loginDetails.name}`)
          
          players[0] = socket.id;
          loginDetails.isCreator = true 
          loginDetails.idSocket = socket.id
          loginDetails.numberOfClients = players.length

          socket.emit('ROOM_CREATED', loginDetails , players)
        } else if (players[1] == null) {
          console.log(`O user ${loginDetails.name} entrou na sala ${loginDetails.roomId}, o server emitiu ROOM_JOINED`)
          
          players[1] = socket.id;
          loginDetails.isCreator = false
          loginDetails.idSocket = socket.id
          loginDetails.numberOfClients = players.length

          socket.emit('ROOM_JOINED', loginDetails, players)
        }

        console.log(players)
        // TODO: IMPLEMENT THE OTHER USERS CASE

        const roomClients = io.sockets.adapter.rooms[loginDetails.roomId] || { length: 0 }
        /*
        if (roomClients.length == 0) {
            console.log(`Criando sala ${loginDetails.roomId}, o user ${loginDetails.name} emitiu room_created`)
            loginDetails.isCreator = true 
            loginDetails.idSocket = socket.id
            loginDetails.numberOfClients = roomClients.length+1

            //prepareRoom(socket,loginDetails)
            socket.join(loginDetails.roomId)
            
            socket.emit('ROOM_CREATED', loginDetails)
        } else {
            console.log(`Entrou na sala ${loginDetails.roomId}, o user ${loginDetails.name} emitiu room_joined`)

            console.log(`User ${loginDetails.name} has enter in the room ${loginDetails.roomId}`)
            loginDetails.isCreator = false
            loginDetails.idSocket = socket.id
            loginDetails.numberOfClients = roomClients.length+1

            //prepareRoom(socket,loginDetails)
            socket.join(loginDetails.roomId)

            socket.emit('ROOM_JOINED', loginDetails)
        }

        var clientId = socket.id;
        console.log("Received User Join" + clientId);
        
        var actualClients = JSON.stringify(clients)
        clients.push(clientId)
        */
    });

    socket.on("OFFER", (socketId, description) => {
      socket.to(socketId).emit("OFFER", socket.id, description);
    });

    socket.on("ANSWER", (socketId, description) => {
      socket.to(socketId).emit("ANSWER", socket.id, description);
    });

    //TODO: Review this implementation
    socket.on('ICE_CANDIDATE', (event) => {
      socket.broadcast.to(event.roomId).emit('ICE_CANDIDATE', event)
    })


});

const port = 3666
server.listen(port,  () => {
  console.log(`> Servidor ativo na porta ${port}`)
});