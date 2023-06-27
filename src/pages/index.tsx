import { io, type Socket } from "socket.io-client";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket-type";
import useTyping from "@/hooks/useTyping";

const inter = Inter({ subsets: ["latin"] });

type Message = {
  author: string;
  message: string;
};

export let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export default function Home() {
  // const [message, setMessage] = useState("");
  // const [author, setAuthor] = useState("");
  // const [allMessages, setAllMessages] = useState<Message[]>([]);\
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [chosenUsername, setChosenUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // typing
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const { isTyping, startTyping, stopTyping, cancelTyping } = useTyping();

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    socketInitializer();

    async function socketInitializer() {
      await fetch("/api/socket");

      socket = io({
        path: "/api/socket_io",
      });
    }

    return () => {
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    socket?.on("NEW_INCOMING_MESSAGE_EVENT", (msg) => {
      setMessages((currentMsg) => [...currentMsg, { author: msg.author, message: msg.message }]);
      console.log(messages);
    });

    socket?.on("USER_HAS_JOINED_EVENT", (msg) => {
      setMessages((currentMsg) => [...currentMsg, { author: "", message: msg }]);
    });

    socket?.on("START_TYPING_MESSAGE_EVENT", (typingInfo: Message) => {
      const user = typingInfo.author;
      setTypingUsers((users) => [...users, user]);
    });

    socket?.on("STOP_TYPING_MESSAGE_EVENT", (typingInfo: Message) => {
      const user = typingInfo.author;
      setTypingUsers((users) => users.filter((u) => u !== user));
    });
  }, [socket]);

  const sendMessage = async () => {
    socket?.emit("CREATED_MESSAGE", { author: chosenUsername, message, room });
    cancelTyping();
    setMessages((currentMsg) => [...currentMsg, { author: chosenUsername, message }]);
    setMessage("");
  };

  const startTypingMessage = () => {
    if (!socket) return;
    socket.emit("START_TYPING_MESSAGE_EVENT", {
      author: chosenUsername,
      message: "",
      room,
    });
  };

  const stopTypingMessage = () => {
    if (!socket) return;
    socket.emit("STOP_TYPING_MESSAGE_EVENT", {
      author: chosenUsername,
      message: "",
      room,
    });
  };

  const handleKeypress = (e: any) => {
    //it triggers by pressing the enter key
    if (e.keyCode === 13) {
      if (message) {
        sendMessage();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isTyping) startTypingMessage();
    else stopTypingMessage();
  }, [isTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length + typingUsers.length]);

  // ***********************************************************//
  // from https://betterprogramming.pub/socket-io-and-nextjs-build-real-time-chat-application-part-1-976555ecba

  return (
    <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
      <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
        {!chosenUsername ? (
          <>
            <h3 className="font-bold text-white text-xl">How people should call you?</h3>
            <input
              type="text"
              placeholder="Identity..."
              value={username}
              className="p-3 rounded-md outline-none"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="JOIN ROOM"
              value={room}
              className="p-3 rounded-md outline-none"
              onChange={(e) => setRoom(e.target.value)}
            />
            <button
              onClick={() => {
                // join room
                socket?.emit("JOIN_ROOM_EVENT", room);
                setChosenUsername(username);
              }}
              className="bg-white rounded-md px-4 py-2 text-xl"
            >
              Go!
            </button>
          </>
        ) : (
          <>
            <p className="font-bold text-white text-xl">Your username: {username}</p>
            <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
              <div className="h-full last:border-b-0 overflow-y-scroll">
                {messages.map((msg, i) => {
                  return (
                    <div className="w-full py-1 px-2 border-b border-gray-200" key={i}>
                      {msg.author} : {msg.message}
                    </div>
                  );
                })}

                {typingUsers.map((user, i) => (
                  <div className="w-full py-1 px-2 border-b border-gray-200 flex" key={i}>
                    <span className="font-bold">{user}</span> is typing...
                    <div className="dotsContainer">
                      <span id="dot1"></span>
                      <span id="dot2"></span>
                      <span id="dot3"></span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-gray-300 w-full flex rounded-bl-md">
                <input
                  type="text"
                  placeholder="New message..."
                  value={message}
                  className="outline-none py-2 px-2 rounded-bl-md flex-1"
                  onChange={(e) => setMessage(e.target.value)}
                  // onKeyUp={handleKeypress}
                  onKeyDown={startTyping}
                  onKeyUp={(e) => {
                    stopTyping();
                    //it triggers by pressing the enter key
                    if (e.key === "Enter") {
                      if (message) {
                        sendMessage();
                      }
                    }
                  }}
                />
                <div className="border-l border-gray-300 flex justify-center items-center  rounded-br-md group hover:bg-purple-500 transition-all">
                  <button
                    className="group-hover:text-white px-3 h-full"
                    onClick={() => {
                      sendMessage();
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );

  // ***********************************************************//
  // from https://github.com/SarathAdhi/socket.io-starter-template

  // useEffect(() => {
  //   socket?.on("RECEIVE_MESSAGE_EVENT", (data) => {
  //     setAllMessages((pre) => [...pre, data]);
  //   });
  // }, [socket]);

  // function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault();

  //   console.log("emitted");

  //   socket?.emit("SEND_MESSAGE_EVENT", {
  //     author,
  //     message,
  //   });
  //   setMessage("");
  // }

  // return (
  //   <main className="flex flex-col items-center justify-center min-h-screen py-2">
  //     <h1 className="text-4xl font-bold text-center">Chat app</h1>
  //     <h1 className="text-2xl font-bold text-center">Enter a username</h1>

  //     <input
  //       className="rounded-lg p-2 m-2 bg-gray-200"
  //       value={author}
  //       onChange={(e) => setAuthor(e.target.value)}
  //     />

  //     <br />
  //     <br />

  //     <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
  //       {allMessages.map(({ author, message }, index) => (
  //         <div className="bg-gray-200 rounded-lg p-2 m-2" key={index}>
  //           {author}: {message}
  //         </div>
  //       ))}

  //       <br />

  //       <form
  //         onSubmit={handleSubmit}
  //         className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center"
  //       >
  //         <input
  //           className="rounded-lg p-2 m-2 bg-gray-200"
  //           name="message"
  //           placeholder="enter your message"
  //           value={message}
  //           onChange={(e) => setMessage(e.target.value)}
  //           autoComplete={"off"}
  //         />
  //       </form>
  //     </div>
  //   </main>
  // );
}
