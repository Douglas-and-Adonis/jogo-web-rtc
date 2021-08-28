const express = require('express');
const { ClientRequest } = require('http');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// cria uma rota para o arquivo index.html
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

async function prepareRoom(socket, data){
    const roomId = data.roomId;
    const existRoom = Room.getRoom(roomId);
    if (existRoom) {
      console.log('--- use exist room. roomId=' + roomId);
    } else {
      console.log('--- create new room. roomId=' + roomId);
      const room = await setupRoom(roomId);
    }
  }

  async function setupRoom(name) {
    const room = new Room(name);
    const router = await worker.createRouter();
    router.roomname = name;
  
    router.observer.on('close', () => {
      console.log('-- router closed. room=%s', name);
    });
    
    router.observer.on('newtransport', transport => {
      console.log('-- router newtransport. room=%s', name);
    });
  
    room.router = router;
    Room.addRoom(room, name);
    return room;
  }

  class Room {
    constructor(name) {
      this.name = name;
      this.producerTransports = {};
      this.messageProducers = {};
  
      this.consumerTransports = {};
      this.messageConsumerSets = {};
  
      this.router = null;
    }
  
    getProducerTrasnport(id) {
      console.log('ROOM getProducerTransport')
      return this.producerTransports[id];
    }
  
    addProducerTrasport(id, transport) {
      this.producerTransports[id] = transport;
      console.log('room=%s producerTransports count=%d', this.name, Object.keys(this.producerTransports).length);
    }
  
    removeProducerTransport(id) {
      delete this.producerTransports[id];
      console.log('room=%s producerTransports count=%d', this.name, Object.keys(this.producerTransports).length);
    }
  
    getProducer(id, label) {
      if (label === 'chat') {
        return this.messageProducers[id];
      }else {
        console.warn('ROOM UNKNOWN producer label=' + label);
      }
    }
  
    getRemoteIds(clientId, label) {
      let remoteIds = [];
      if (label === 'chat') {
        for (const key in this.messageProducers) {
          if (key !== clientId) {
            remoteIds.push(key);
          }
        }
      }
      return remoteIds;
    }
  
    addProducer(id, producer, label) {
      if (label === 'chat') {
        this.messageProducers[id] = producer;
        console.log('room=%s messageProducers count=%d', this.name, Object.keys(this.messageProducers).length);
      }else {
        console.warn('ROOM addProducer UNKNOWN producer label=' + label);
      }
    }
  
    removeProducer(id, label) {
      if (label === 'chat') {
        delete this.messageProducers[id];
        console.log('messageProducers count=' + Object.keys(this.messageProducers).length);
      }else {
        console.warn('ROOM UNKNOWN producer label=' + label);
      }
    }
  
    getConsumerTrasnport(id) {
      return this.consumerTransports[id];
    }
  
    addConsumerTrasport(id, transport) {
      this.consumerTransports[id] = transport;
      console.log('room=%s add consumerTransports count=%d', this.name, Object.keys(this.consumerTransports).length);
    }
  
    removeConsumerTransport(id) {
      delete this.consumerTransports[id];
      console.log('room=%s remove consumerTransports count=%d', this.name, Object.keys(this.consumerTransports).length);
    }
  
    getConsumerSet(localId, label) {
      if (label === 'chat') {
        return this.messageConsumerSets[localId];
      }else {
        console.warn('WARN: getConsumerSet() UNKNWON label=%s', label);
      }
    }
  
    addConsumerSet(localId, set, label) {
      if (label === 'chat') {
        this.messageConsumerSets[localId] = set;
      } else {
        console.warn('WARN: addConsumerSet() UNKNWON label=%s', label);
      }
    }
  
    removeConsumerSetDeep(localId) {
      const messageSet = this.getConsumerSet(localId, 'chat');
      delete this.messageConsumerSets[localId];
      if (messageSet) {
        for (const key in messageSet) {
          const consumer = messageSet[key];
          consumer.close();
          delete messageSet[key];
        }
  
        console.log('room=%s removeConsumerSetDeep message consumers count=%d', this.name, Object.keys(messageSet).length);
      }
    }
  
    getConsumer(localId, remoteId, label) {
      const set = this.getConsumerSet(localId, label);
      if (set) {
        return set[remoteId];
      }
      else {
        return null;
      }
    }
  
  
    addConsumer(localId, remoteId, consumer, label) {
      const set = this.getConsumerSet(localId, label);
      if (set) {
        set[remoteId] = consumer;
        console.log('room=%s consumers label=%s count=%d', this.name, label, Object.keys(set).length);
      }
      else {
        console.log('room=%s new set for label=%s, localId=%s', this.name, label, localId);
        const newSet = {};
        newSet[remoteId] = consumer;
        this.addConsumerSet(localId, newSet, label);
        console.log('room=%s consumers label=%s count=%d', this.name, label, Object.keys(newSet).length);
      }
    }
  
    removeConsumer(localId, remoteId, label) {
      const set = this.getConsumerSet(localId, label);
      if (set) {
        delete set[remoteId];
        console.log('room=%s consumers label=%s count=%d', this.name, label, Object.keys(set).length);
      }
      else {
        console.log('NO set for room=%s label=%s, localId=%s', this.name, label, localId);
      }
    }
  
    // --- static methtod ---
    static staticInit() {
      rooms = {};
    }
  
    static addRoom(room, name) {
      Room.rooms[name] = room;
      console.log('static addRoom. name=%s', room.name);
      //console.log('static addRoom. name=%s, rooms:%O', room.name, room);
    }
  
    static getRoom(name) {
      return Room.rooms[name];
    }
  
    static removeRoom(name) {
      delete Room.rooms[name];
    }
  }

  Room.rooms = {};

  // --- default room ---
let defaultRoom = null

const port = 3666
server.listen(port)