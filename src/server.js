const {networkInterfaces} = require("os")
const {createServer} = require("http");
const {Server} = require("socket.io");
const express = require("express");
const {join} = require("path")

let net = networkInterfaces();
let connection = net["Ethernet"] || net["Wi-Fi"];

const client = join(__dirname,"views/client/index.html");
const public = join(__dirname,"views/client");

const app = express();
const http = createServer(app);
const io = new Server(http);

const port = 3000;
let ip;

if(connection){
    connection.forEach(element => {
        if(element.family == "IPv4"){
            ip = element.address;
        }
    })
}

function startLocalServer(){
    return new Promise( (resolve, rejects) => {

        app.use(express.static(public))

        app.get("/", (req, res) => {
            res.sendFile(client);
        })
    
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
    
        http.listen(port);
        
        resolve({ip, port})
    })
}

exports.startLocalServer = startLocalServer;