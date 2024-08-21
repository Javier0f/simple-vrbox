const {ipcRenderer} = require("electron");
const videoStram = document.getElementById("videoStram");
const btnCapura = document.getElementById("btnCapura");
const btnTransmicion = document.getElementById("btnTransmicion");
const textarea = document.getElementById("textarea");

btnCapura.onclick = async () => {
    let video = await navigator.mediaDevices.getDisplayMedia({video:true, audio: false});
    videoStram.srcObject = video;
}

btnTransmicion.onclick = () => {
    ipcRenderer.send("startServer")
}

ipcRenderer.on("startServer", (e,args) => {
    textarea.value = `http://${args.ip}:${args.port}/`
})