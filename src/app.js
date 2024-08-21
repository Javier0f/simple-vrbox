const {startLocalServer} = require("./server.js")
const {app, BrowserWindow, desktopCapturer, session, ipcMain} = require("electron")
const {join} = require("path")

const File = join(__dirname,"views/server/index.html")
let host;

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

    session.defaultSession.setDisplayMediaRequestHandler( async (req, call) => {
        let sources = await desktopCapturer.getSources({types:["screen"]});
        call({video:sources[0], audio:"loopbackWithMute"})
    })
    
    ipcMain.on("startServer", () => {
        if(!host){
            startLocalServer()
            .then(ret => {
                host = ret;
                win.webContents.send("startServer", host)
            });
        }else{
            win.webContents.send("startServer", host)
        }
    })
}


app.whenReady()
.then(mainWindow);


// startLocalServer((state, ip, port) => {
//     console.log(`server is ${state} on http://${ip}:${port}`)
// })