import {io} from "./socket.io-client.js"
const {ipcRenderer} = require("electron")
const videoStram = document.getElementById("videoStram");
const btnCapura = document.getElementById("btnCapura");
const btnTransmicion = document.getElementById("btnTransmicion");
const btnServer = document.getElementById("btnServer");
const textarea = document.getElementById("textarea");
const ventanasConteiner = document.getElementById("ventanas");
const resolucion = document.getElementById("resolucion")

const pc = new RTCPeerConnection();

let socket;

let videoConfig = {
    width: 1920,
    height: 1080
}

async function createOffer(){
    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer',offer)
}

function connetSocket(host){
    let url = `http://${host.ip}:${host.port}/`;
    
    textarea.innerText = url;

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
}

function getSources(){
    ipcRenderer.send("sources",0);

    ipcRenderer.on("sources", (evnt,sources) => {
        for (let i = 0; i < sources.length; i++) {
            let option = document.createElement('option');
            console.log(sources[0].thumbnail.getSize())
            option.value = i;
            option.innerText = sources[i].name;
            option.setAttribute('mode', 'window')
            ventanasConteiner.appendChild(option)
        }
    })
}

async function capture(){
    let video = await navigator.mediaDevices.getDisplayMedia({video:videoConfig, audio: false});

    videoStram.srcObject = video;

    let track = video.getVideoTracks()[0]

    pc.addTrack(track, video)
}

pc.onicecandidate = (evnt) => {
    if(evnt.candidate){
        socket.emit("iceCandidate", evnt.candidate)
    }
}

btnServer.onclick = () => {
    ipcRenderer.send("startServer")
}

btnTransmicion.onclick = () => {
    createOffer();
}

ventanasConteiner.onchange = (evnt) =>{
    ipcRenderer.send("captureScreen",{index:ventanasConteiner.value,mode:ventanasConteiner.options[ventanasConteiner.selectedIndex].getAttribute('mode')})
    capture();
}

resolucion.onchange = () => {
    let width = parseInt(resolucion.value.split('x')[0],10)
    let height = parseInt(resolucion.value.split('x')[1],10)
    
    videoStram.setAttribute('width', width)
    videoStram.setAttribute('height', height)

    videoConfig.height = height;
    videoConfig.width = width;
    
    capture()
}

ipcRenderer.on("startServer", (e,host) => {
    connetSocket(host)
})

ipcRenderer.send("captureScreen", {index:0, mode:'screen'})

getSources();
capture();
