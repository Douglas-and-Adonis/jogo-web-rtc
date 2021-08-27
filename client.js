const socket = io()
const audio = document.querySelector("video");

let roomId = 1
let name
let isCreator
let idSocket
let numberOfClients

let loginDetails = {roomId, name, isCreator, idSocket, numberOfClients}

alert('Informe o nome do usuario');

connectButton.addEventListener('click', () => { joinRoom(userInput.value) })

const peerConnections = {};
var midia;

const iceServers = {
  iceServers: [
  { urls: "stun:smu20211.sj.ifsc.edu.br" },
      {
        urls: "turn:smu20211.sj.ifsc.edu.br",
        username: "douglas.as1997",
        credential: "smu20211"
      }
  ],
}

socket.on("connect", function() {
});

socket.on('ROOM_CREATED', (detailsReceived, playersReceived) => {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      midia = stream;
    })
    .catch((error) => console.log(error));

  console.log('Socket event callback: ROOM_CREATED')
  console.log(`Connection Details received from Server: ${detailsReceived}`);
  console.log(`Actual players on room received from Server: ${playersReceived}`);

  loginDetails = detailsReceived

  userInput.disabled = true
  connectButton.disabled = true

  loginDetails.isRoomCreator = true
  loginDetails.numberOfClients = playersReceived.lenght
})

socket.on('ROOM_JOINED',  (detailsReceived, playersReceived) => {
  console.log('Socket event callback: ROOM_JOINED')
  console.log("Conectado ao Servidor, nosso ID é %s", socket.id);
  console.log(`Connection Details received from Server: ${detailsReceived}`);
  console.log(`Actual players on room received from Server: ${playersReceived}`);
  
  loginDetails = detailsReceived

  userInput.disabled = true
  connectButton.disabled = true

  loginDetails.isRoomCreator = false
  loginDetails.numberOfClients = playersReceived.lenght

  
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      midia = stream;
      const peerConnection = new RTCPeerConnection(iceServers);
      peerConnections[playersReceived[0]] = peerConnection;

      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          console.log("SENDING ICE_CANDIDATE")
          socket.emit("ICE_CANDIDATE", playersReceived[0], event.candidate)
        }
      };

      peerConnection.ontrack = ({ streams: [midia] }) => {
        audio.srcObject = midia;
      };

      peerConnection
      .createOffer()
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        console.log("SENDING OFFER")
        socket.emit("OFFER", playersReceived[0], peerConnection.localDescription);
      });
    });
});

socket.on("OFFER", (id, description) => {
  peerConnection = new RTCPeerConnection(iceServers);

  midia
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, midia));

  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      console.log("SENDING ANSWER")
      socket.emit("ANSWER", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = ({ streams: [midia] }) => {
    audio.srcObject = midia;
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      console.log("SENDING ICE_CANDIDATE")
      socket.emit("ICE_CANDIDATE", id, event.candidate);
    }
  };
});

socket.on("ANSWER", (id, description) => {
  console.log("RECEIVED ANSWER")
  peerConnections[id].setRemoteDescription(description);
  console.log(peerConnections[id]);
});

socket.on("ICE_CANDIDATE", (id, candidate) => {
  console.log("RECEIVED ICE_CANDIDATE")
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  console.log(peerConnections[id]);
});

socket.on("DISCONNECT", id => {
  peerConnections[id].close();
  delete peerConnections[id];
  console.log(peerConnections[id]);
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

function joinRoom(user) {
    if (user === '') {
      alert('Informe o nome do usuario');
    } else {
      loginDetails.name = user;
      loginDetails.roomId = 1;

      console.log('Enviou JOIN com socket id: ', socket.id) 
      socket.emit('JOIN', loginDetails)
    }
  }