import { useEffect, useRef, useState } from "react";
import { BsFillMicMuteFill } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import { FaVideo, FaVideoSlash } from "react-icons/fa6";
import { MdCallEnd } from "react-icons/md";
import { CiStreamOn } from "react-icons/ci";
import { PiChatsCircleFill, PiChatsCircleDuotone } from "react-icons/pi";
import { IoCopyOutline } from "react-icons/io5";
import { Chat } from "./Chat";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const refvideo = useRef<HTMLVideoElement>(null);
  const audioStatus = useRef<boolean>(true);
  const [ismute, setIsmute] = useState<boolean>(false);
  const [isvideo, setIsvideo] = useState<boolean>(true);
  const [isconnected, setIsconnected] = useState<boolean>(false);
  const [ischatopen, setIschatopen] = useState<boolean>(true);

  const socketRef = useRef<WebSocket | null>(null);

  const receiverLink = window.location.href.replace("sender", "receiver");
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);
    socketRef.current = socket;
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
  }, []);

  useEffect(() => {
    console.log(socket);
    if (!socket) {
      console.log("Socket is not connected");
      return;
    }
    socket.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "chat") {
        console.log(message.message);
      }
    };
  }, [socket]);
  const startsendingvideo = async () => {
    if (!socket) return;
    const pc = new RTCPeerConnection();
    setIsconnected(true);

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
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
        if (message.candidate) {
          await pc.addIceCandidate(message.candidate);
        }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      // audio: true,
    });
    stream
      .getTracks()
      .forEach((track) => pc.addTransceiver(track, { streams: [stream] }));
    if (refvideo.current) {
      refvideo.current.srcObject = stream;
    }
    setIsconnected(true);
  };

  const stopsendingvideo = () => {
    if (refvideo.current) {
      const stream = refvideo.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      refvideo.current.srcObject = null;
    }
    if (socket) {
      socket.send(JSON.stringify({ type: "close" }));
      setIsconnected(false);
      socket.close();
    }
  };

  const mute = () => {
    audioStatus.current = !audioStatus.current;
    (refvideo.current?.srcObject as MediaStream)
      ?.getAudioTracks()
      .forEach((track) => {
        track.enabled = audioStatus.current;
      });
    setIsmute(!audioStatus.current);
  };

  const vidctrl = () => {
    (refvideo.current?.srcObject as MediaStream)
      ?.getVideoTracks()
      .forEach((track) => {
        track.enabled = !track.enabled;
      });
    setIsvideo(!isvideo);
  };

  const chatpannal = () => {
    setIschatopen(!ischatopen);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(receiverLink).then(
      () => {
        console.log("Link copied to clipboard");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };
  return (
    <div className="w-full h-screen flex bg-black p-4">
      <div className="flex flex-col items-center justify-center w-3/4 h-full bg-black rounded-lg p-4 shadow-lg">
        {isconnected ? (
          <video
            ref={refvideo}
            autoPlay
            className="w-full h-full object-cover rounded-lg"
          ></video>
        ) : (
          <div className="w-full h-full bg-gray-800 flex justify-center items-center rounded-lg">
            <div className="text-white text-2xl font-bold">
              Start The Stream To Connect with Receiver.....
            </div>
          </div>
        )}

        <div className="mt-4 flex space-x-4">
          {!isconnected && (
            <button
              onClick={startsendingvideo}
              className="w-12 h-10 text-white bg-sky-500 hover:bg-sky-600 flex justify-center items-center rounded-full shadow-md"
            >
              <CiStreamOn className="h-5 w-5 font-extrabold" />
            </button>
          )}
          {isconnected && (
            <button
              onClick={stopsendingvideo}
              className="w-12 h-10 text-white text-center flex justify-center items-center bg-red-500 hover:bg-red-600 rounded-full shadow-md"
            >
              <MdCallEnd className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={mute}
            className="w-10 h-10 border-2 flex justify-center items-center text-cen rounded-full border-cyan-100 text-white shadow-md"
          >
            {ismute ? (
              <BsFillMicMuteFill className="h-5 w-5" />
            ) : (
              <FaMicrophone className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={vidctrl}
            className="w-10 h-10 border-2 flex justify-center items-center text-cen rounded-full border-cyan-100 text-white shadow-md"
          >
            {isvideo ? (
              <FaVideo className="h-5 w-5" />
            ) : (
              <FaVideoSlash className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={chatpannal}
            className="w-10 h-10 border-2 flex justify-center items-center text-cen rounded-full border-cyan-100 text-white shadow-md"
          >
            {ischatopen ? (
              <PiChatsCircleFill className="h-5 w-5" />
            ) : (
              <PiChatsCircleDuotone className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      {ischatopen && isconnected && <Chat socket={socketRef.current} />}
      {!isconnected && (
        <div className="w-1/4 h-full bg-gray-700 rounded-lg p-4 shadow-lg flex flex-col items-center justify-center">
          <div className="w-[80%] h-14 bg-black flex">
            <input
              type="text"
              value={receiverLink}
              readOnly
              className="bg-black text-white w-full h-full p-2 rounded-l-lg"
            />

            <button
              onClick={copyToClipboard}
              className="bg-sky-500 hover:bg-sky-600 text-white p-2 "
            >
              <IoCopyOutline className="h-5 w-5" />
            </button>
          </div>
          <div className="w-[85%] px-1 h-12 bg-black flex justify-center items-center mt-4">
            <div className="text-white  font-mono">
              Share this link with Receiver To Connect with Receiver.....
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
