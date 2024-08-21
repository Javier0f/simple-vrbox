import {io} from "./socket.io-client.js"
const {ipcRenderer} = require("electron");
const videoStram = document.getElementById("videoStram");
const btnCapura = document.getElementById("btnCapura");
const btnTransmicion = document.getElementById("btnTransmicion");
const btnServer = document.getElementById("btnServer");
const textarea = document.getElementById("textarea");

let url;
let socket;
let video;

const pc = new RTCPeerConnection();

async function createOffer(){
    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer",offer) 
}

function connectHost(host){
    url = `http://${host.ip}:${host.port}/`;
    
    textarea.value = url;
    
    socket = io(url);
    socket.on("candidate", candidate => {
        pc.addIceCandidate(candidate)
    })
    socket.on("answer", async answer => {
        await pc.setRemoteDescription(answer);
    })
    socket.on("reload", () => {
        location.reload()
    })

    btnServer.disabled = true;
}



/**
 * Pregunta al preceso principal si ya hay un servidor corriendo
 * si ya hay un server iniciado, solo agrega la direccion del server al socket
 */
ipcRenderer.send("serverLive")
ipcRenderer.on("serverLive", (e,host) => {
    if(host){
        connectHost(host);
        socket.emit("reload")
    }
})

/**
 * Envia una señal al proceso principal para que inici el servidor
 * luego crea un socket y agrega la direccion del server
 */
ipcRenderer.on("startServer", (e,host) => {
    connectHost(host);
})

pc.onicecandidate = (evnt) => {
    if(evnt.candidate){
        socket.emit("iceCandidate", evnt.candidate)
    }
}

btnCapura.onclick = async () => {
    video = await navigator.mediaDevices.getDisplayMedia({video:true, audio: false});
    videoStram.srcObject = video;

    video.getVideoTracks().forEach(track => {
        pc.addTrack(track, video)
    })
}

btnTransmicion.onclick = async () => {
    if(socket){
        await createOffer();
        return
    }
    alert("Debes iniciar el servidor primero")
}

btnServer.onclick = () => {
    ipcRenderer.send("startServer")
}

