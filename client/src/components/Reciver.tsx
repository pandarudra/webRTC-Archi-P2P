import { useEffect, useRef } from "react";

export const Reciver = () => {
  const Vidref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "reciver" }));
    };
    socket.onmessage = async (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.send(
              JSON.stringify({ type: "iceCandidate", candidate: e.candidate })
            );
          }
        };

        pc.ontrack = (e) => {
          if (e.streams && e.streams[0] && Vidref.current) {
            Vidref.current.srcObject = e.streams[0];
          }
        };

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
        );
      }
    };
  }, []);
  return (
    <div>
      Receiver
      <video ref={Vidref} autoPlay playsInline muted></video>
    </div>
  );
};
