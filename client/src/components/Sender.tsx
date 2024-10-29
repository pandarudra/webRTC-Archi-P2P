import { useEffect, useRef, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const refvideo = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    setSocket(socket);
  }, []);

  const startsendingvideo = async () => {
    if (!socket) return;
    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded = async () => {
      const Offer = await pc.createOffer();
      await pc.setLocalDescription(Offer);
      socket?.send(
        JSON.stringify({ type: "createOffer", sdp: pc.localDescription })
      );
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: e.candidate })
        );
      }
    };

    socket.onmessage = async (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "createAnswer") {
        await pc.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate") {
        if (pc) {
          await pc.addIceCandidate(message.candidate);
        }
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // pc.addTrack(stream.getTracks()[0]);
    stream
      .getTracks()
      .forEach((track) => pc.addTransceiver(track, { streams: [stream] }));
    if (refvideo.current) {
      refvideo.current.srcObject = stream;
    }
  };
  return (
    <div className="w-full h-screen flex justify-center items-center flex-col bg-zinc-900">
      <button
        onClick={startsendingvideo}
        className="w-24  h-10 text-white border-2 border-sky-200"
      >
        Send Video
      </button>
      <video ref={refvideo} autoPlay></video>
    </div>
  );
};
