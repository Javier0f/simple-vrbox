
const videoConfig = {
    width: 680,
    height: 420,
    framerate: 30
}

function createEncoder(){
    const encoder = new VideoEncoder({
        output: (chunk, meta) => {
            console.log("chunk codificado", chunk)
        },
        error: error => {
            console.error(error)
        }
    });

    encoder.configure({
        codec: 'h264',
        width: '680',
        height: '420',
        framerate: '30',
        bitrate: '50000'
    })

    return encoder;
}

async function screenCapute(){
    try{
        return navigator.mediaDevices.getDisplayMedia({video:videoConfig, audio: false})
    }catch(err){
        console.error(err)
    }
}

async function StartEncodig(){
    const video = await screenCapute();
    const videoTrack = video.getVideoTracks()[0];
    const videoProcessor = new MediaStreamTrackProcessor(videoTrack);
    const reader = videoProcessor.readable.getReader();

    const encoder = createEncoder();

    async function processFrame(){
        const {value: videoFrame, done} = await reader.read();
        console.log(done,videoFrame)
        if (done) return;

        encoder.encode(videoFrame);

        videoFrame.close();

        processFrame();
    }

    processFrame();
}

exports.StartEncodig = StartEncodig;