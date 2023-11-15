
class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {
        //#region Scene setup

        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);

        // This creates and positions an arc-rotate camera (non-mesh)
        var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        //#endregion

        //#region Audio capture

        const audioContext = new AudioContext();

        // Square-wave synth with gain control.
        const synthNode = new OscillatorNode(audioContext, { type: "square", frequency: 440 });
        const synthGainNode = new GainNode(audioContext, { gain: 0.1 });
        synthNode.connect(synthGainNode);
        synthGainNode.connect(audioContext.destination);

        // Recording nodes and functions.
        let recorderStreamNode: MediaStreamAudioDestinationNode | null = null;
        let recorderNode: MediaRecorder | null = null;

        const startRecording = () => {
            console.debug("Starting recording.");

            recorderStreamNode = new MediaStreamAudioDestinationNode(audioContext);
            synthGainNode.connect(recorderStreamNode);
            recorderNode = new MediaRecorder(recorderStreamNode.stream);
            recorderNode.start();
            synthNode.start();
        }

        const stopRecording = () => {
            console.debug("Stopping recording.");

            recorderNode?.addEventListener("dataavailable", (e) => {
                const blob = e.data;

                console.debug("Audio blob:");
                console.debug(blob);

                recorderNode = null;
                recorderStreamNode = null;

                setTimeout(() => {
                    playBlob(blob);
                }, 5000);
            });

            recorderNode?.stop();
            synthNode.stop();
        }

        // Audio JS blob playback node and function.
        let audioHtmlElement: HTMLAudioElement | null = null;
        let audioSourceNode: MediaElementAudioSourceNode | null = null;

        const playBlob = (blob: Blob) => {
            console.debug("Playing blob.");

            audioHtmlElement = new Audio(URL.createObjectURL(blob));
            audioSourceNode = new MediaElementAudioSourceNode(audioContext, { mediaElement: audioHtmlElement });
            audioSourceNode.connect(audioContext.destination);

            audioHtmlElement.play();
        }

        // User interaction to start audio context.
        document.onclick = () => {
            audioContext.resume();
        }

        //#endregion

        //#region GUI

        // Setup GUI.
        let canvasZone = document.getElementById("canvasZone")!;
        canvasZone.style.position = "relative";

        const oldGui = document.getElementById("datGui");
        if (oldGui) {
            canvasZone.removeChild(oldGui);
        }

        const gui = new dat.GUI({ autoPlace: false });
        canvasZone.appendChild(gui.domElement);
        gui.domElement.id = "datGui";
        gui.domElement.style.position = "absolute";
        gui.domElement.style.top = "0";
        gui.domElement.style.right = "0";

        const guiFunctions = {
            startRecording: startRecording,
            stopRecording: stopRecording
        };

        gui.add(guiFunctions, "startRecording").name("Start recording");
        gui.add(guiFunctions, "stopRecording").name("Stop recording");

        //#endregion

        return scene;
    }
}

declare var dat: any;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export { Playground };
