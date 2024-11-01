import { useEffect, useRef } from "react";
import { Chat } from "./Chat";

export const Reciver = () => {
  const Vidref = useRef<HTMLVideoElement>(null);
  const pcref = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "reciver" }));
    };
    socket.onmessage = async (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
        pcref.current = pc;
        pc.setRemoteDescription(message.sdp);
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.send(
              JSON.stringify({ type: "iceCandidate", candidate: e.candidate })
            );
          }
        };

        pc.ontrack = (e) => {
          console.log(e);
          if (e.streams && e.streams[0] && Vidref.current) {
            Vidref.current.srcObject = e.streams[0];
            console.log("Stream added");
          }
        };

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
        );
      } else if (message.type === "close") {
        if (Vidref.current) {
          Vidref.current.srcObject = null;
        }
        if (pcref.current) {
          pcref.current.close();
          pcref.current = null;
        }
        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({ type: "close" }));
        }
      } else if (message.type === "chat") {
        console.log(message.message);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div className="w-[80%] max-w-4xl h-full flex  items-center bg-black rounded-lg p-4 shadow-lg">
        <video
          ref={Vidref}
          autoPlay
          playsInline
          muted
          className=" h-full object-contain rounded-lg"
        ></video>
      </div>
      <div className="w-full h-full">
        <Chat socket={socketRef.current} />
      </div>
    </div>
  );
};
