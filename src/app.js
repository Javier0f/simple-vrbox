const {startLocalServer} = require("./server.js")
const {app, BrowserWindow, desktopCapturer, session, ipcMain} = require("electron")
const {join} = require("path")

const File = join(__dirname,"views/server/index.html")
let host;

function selecWindow(arg){
    session.defaultSession.setDisplayMediaRequestHandler((req, call) => {
        desktopCapturer.getSources({
            types:[arg.mode]
        }).then( sources => {
            call({video:sources[arg.index], audio:'loopbackWithMute'});
        })

    })
}

function mainWindow(){
    const win = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile(File)
    win.on('close', app.quit)

    ipcMain.on("captureScreen",(evnt, index) => {
        selecWindow(index);
    })

    ipcMain.on("sources", () => {
        desktopCapturer.getSources({types:['window']})
        .then(source => {
            win.webContents.send("sources", source)
        })
    })

    ipcMain.on("startServer", () => {
        if(!host){
            host = startLocalServer()
            win.webContents.send("startServer", host)
            return
        }

        win.webContents.send("startServer", host)
    })

    ipcMain.on("serverLive",() => {
        host ? win.webContents.send("serverLive", host) : win.webContents.send("serverLive", false)
    })
}


app.whenReady()
.then(mainWindow);