
const socket = io.connect("/", {path: "/douglas.as1997/socket.io"});
// const audio = document.querySelector("video");

let roomId = 1
let name
let isCreator
let idSocket
let numberOfClients

let loginDetails = {roomId, name, isCreator, idSocket, numberOfClients}

alert('Informe o nome do usuario');

var connectButton = document.getElementById("connect-button");
var userInput = document.getElementById("user-input");

connectButton.addEventListener('click', () => { joinRoom(userInput.value) })


let localConnection = null;   // RTCPeerConnection for our "local" connection
let remoteConnection = null;  // RTCPeerConnection for the "remote"
var midia;

var info = 0

const peerConnections = {};

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

  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      midia = stream;
  })
  .catch((error) => console.log(error));
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
      localConnection = new RTCPeerConnection(iceServers);
      // const peerConnection = new RTCPeerConnection(iceServers);
      // peerConnections[playersReceived[0]] = peerConnection;

      midia.getTracks().forEach(track => localConnection.addTrack(track, midia));
      localConnection.onicecandidate = ({ candidate }) => {
          candidate && socket.emit("ICE_CANDIDATE", playersReceived[0], candidate)
      };

      localConnection.ontrack = ({ streams: [midia] }) => {
        audio.srcObject = midia;
      };

      localConnection
      .createOffer()
      .then((sdp) => localConnection.setLocalDescription(sdp))
      .then(() => {
        console.log("SENDING OFFER")
        socket.emit("OFFER", playersReceived[0], localConnection.localDescription);
      });
    });
});

socket.on("OFFER", (id, description) => {
  // peerConnection = new RTCPeerConnection(iceServers);
  remoteConnection = new RTCPeerConnection(iceServers);

  midia
    .getTracks()
    .forEach((track) => remoteConnection.addTrack(track, midia));

  remoteConnection.onicecandidate = ({ candidate })=> {
    if (candidate) {
      console.log("SENDING ICE_CANDIDATE")
      socket.emit("ICE_CANDIDATE", id, candidate);
    }
  };

  remoteConnection
    .setRemoteDescription(description)
    .then(() => remoteConnection.createAnswer())
    .then(sdp => remoteConnection.setLocalDescription(sdp))
    .then(() => {
      console.log("SENDING ANSWER")
      socket.emit("ANSWER", id, remoteConnection.localDescription);
    });

  remoteConnection.ontrack = ({ streams: [midia] }) => {
    audio.srcObject = midia;
  };
});

socket.on("ANSWER", (id, description) => {
  console.log("RECEIVED ANSWER")
  // peerConnections[id].setRemoteDescription(description);
  localConnection.setRemoteDescription(description);
  console.log(peerConnections[id]);
});

socket.on("ICE_CANDIDATE", (id, candidate) => {
  console.log("RECEIVED ICE_CANDIDATE")
  const connection = localConnection || remoteConnection;
  connection.addIceCandidate(new RTCIceCandidate(candidate));
  //peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  //console.log(peerConnections[id]);
});

socket.on("DISCONNECT", id => {
  peerConnections[id].close();
  delete peerConnections[id];
  console.log(peerConnections[id]);
});

socket.on("INFO", info => {
  this.info = info
  sendSome
})

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

setInterval(sendSome, 200);
function sendSome() {
  socket.emit("INFO", info)
}

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
