import * as child_process from "child_process";

console.log("Starting IPC process...");

// Fork the server process
let lspProcess = child_process.fork("out/src/server.js", [ "--node-ipc" ]);
let messageId = 1;

function send(method: string, params: object) {
    let message = {
        jsonrpc: "2.0",
        id: messageId++,
        method: method,
        params: params
    };
    console.log("Sending message:", JSON.stringify(message, null, 2));
    lspProcess.send(message);
}

// Initialize connection
function initialize() {
    send("initialize", {
        rootPath: process.cwd(),
        processId: process.pid,
        capabilities: {
            textDocument: {
                synchronization: {
                    didSave: true
                }
            }
        }
    });
}

// Listen for messages from the child process
lspProcess.on('message', function (json) {
    console.log("Received message:", json);
});

// Handle errors
lspProcess.on('error', (err) => {
    console.error("IPC process error:", err);
});

lspProcess.on('exit', (code) => {
    console.log(`IPC process exited with code ${code}`);
});

// Start initialization
initialize();
