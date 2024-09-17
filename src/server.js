const {networkInterfaces} = require("os")
const {createServer} = require("http");
const {Server} = require("socket.io");
const express = require("express");
const {join} = require("path")

const net = networkInterfaces();
const connection = net["Ethernet"] || net["Wi-Fi"];
const familyIndex = connection.findIndex(element => element.family == 'IPv4')

const client = join(__dirname,"views/client/index.html");
const public = join(__dirname,"views/client");

const app = express();
const http = createServer(app);
const io = new Server(http);

const port = 3000;
const ip = connection[familyIndex].address;

function startSocket(){
    io.on("connection", socket => {
        console.log(socket.id)

        socket.on("offer", offer => {
            socket.broadcast.emit("offer", offer)
        })

        socket.on("answer", answer => {
            socket.broadcast.emit("answer", answer)
        })

        socket.on("iceCandidate", candidate => {
            socket.broadcast.emit("candidate", candidate)
        })

        socket.on("reload", () => {
            socket.broadcast.emit("reload")
        })
    })
}

function startServer(){
    app.use(express.static(public))

    app.get('/', (req, res) => {
        res.sendFile(client)
    })

    http.listen(port)
}

function startLocalServer(){
    
    startServer();
    startSocket();

    return {ip, port}
}

exports.startLocalServer = startLocalServer;