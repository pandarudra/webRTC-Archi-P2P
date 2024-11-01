import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: any = null;
let receiverSocket: any = null;

wss.on("connection", (ws: any) => {
  ws.on("error", console.error);
  ws.on("message", (data: any) => {
    const message = JSON.parse(data);
    if (message.type === "sender") {
      senderSocket = ws;
      console.log("Sender connected");
    } else if (message.type === "reciver") {
      receiverSocket = ws;
      console.log("Receiver connected");
    } else if (message.type === "createOffer") {
      if (ws !== senderSocket) {
        return;
      }
      console.log("Creating offer");
      receiverSocket.send(
        JSON.stringify({
          type: "createOffer",
          sdp: message.sdp,
        })
      );
    } else if (message.type === "createAnswer") {
      if (ws !== receiverSocket) {
        return;
      }
      console.log("Creating answer");
      senderSocket.send(
        JSON.stringify({
          type: "createAnswer",
          sdp: message.sdp,
        })
      );
    } else if (message.type === "iceCandidate") {
      if (ws === senderSocket) {
        receiverSocket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: message.candidate,
          })
        );
      } else if (ws === receiverSocket) {
        senderSocket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: message.candidate,
          })
        );
      } else if (message.type === "close") {
        if (senderSocket) {
          senderSocket.send(JSON.stringify({ type: "close" }));
          senderSocket.close();
          senderSocket = null;
        }
        if (receiverSocket) {
          receiverSocket.send(JSON.stringify({ type: "close" }));
          receiverSocket.close();
          receiverSocket = null;
        }
      }
    } else if (message.type === "chat") {
      if (ws === senderSocket) {
        receiverSocket.send(
          JSON.stringify({ type: "chat", message: message.message })
        );
      } else if (ws === receiverSocket) {
        senderSocket.send(
          JSON.stringify({ type: "chat", message: message.message })
        );
      }
    }
  });

  ws.on("close", () => {
    if (ws === senderSocket) {
      senderSocket = null;
      console.log("Sender disconnected");
    } else if (ws === receiverSocket) {
      receiverSocket = null;
      console.log("Receiver disconnected");
    }
  });
});
