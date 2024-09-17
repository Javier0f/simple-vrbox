import {io} from "./socket.io-client.js";
const videoStream = document.getElementById("videoStream");

const socket = io();

const pc = new RTCPeerConnection();

pc.onicecandidate = (evnt) => {
    if(evnt.candidate){
        socket.emit("iceCandidate", evnt.candidate)
    }
}

pc.onconnectionstatechange = state => {
    if(pc.connectionState == "disconnected"){
        location.reload();
    }
}

pc.ontrack = track => {
    videoStream.srcObject = track.streams[0]
    console.log(track.streams)
}

socket.on("reload", () => {
    location.reload()
})

socket.on("offer",async  offer => {
    await pc.setRemoteDescription(offer);
    let answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", answer);
})

socket.on("disconnect", () => {
    location.reload()
})

socket.on("candidate", candidate => {
    pc.addIceCandidate(candidate)
})