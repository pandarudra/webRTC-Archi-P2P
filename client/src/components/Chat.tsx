import { FC, useEffect, useState } from "react";
import "../CSS/style.css";

interface ChatProps {
  socket: WebSocket | null;
}

export const Chat: FC<ChatProps> = ({ socket }) => {
  const [chat, setChat] = useState<string>("");
  const [socketRef, setSocketRef] = useState<WebSocket | null>(null);

  useEffect(() => {
    setSocketRef(socket);
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
  const sendMessage = () => {
    if (!socketRef) return;

    try {
      // console.log(socketRef);
      socketRef?.send(JSON.stringify({ type: "chat", message: chat }));
      setChat("");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-auto h-full bg-black rounded-lg p-4 shadow-lg ">
      <div className="w-full h-full bg-gray-800 rounded-lg p-2 overflow-y-auto">
        <div className="text-white w-full h-[90%] overflow-y-scroll custom-scrollbar"></div>
        <div className="w-full flex mt-2">
          <input
            type="text"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-l-lg outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-r-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
