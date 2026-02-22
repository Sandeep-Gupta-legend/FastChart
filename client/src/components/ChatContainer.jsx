import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { AuthContext } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const { authUser, axios, socket } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollEnd = useRef();

  const conversationId = useMemo(() => selectedUser?._id, [selectedUser?._id]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const { data } = await axios.get(`/api/messages/${conversationId}`);
        if (data.success) {
          setMessages(data.messages);
        } else {
          toast.error(data.message || "Unable to load messages");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [axios, conversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const isRelevant =
        conversationId &&
        ((message.senderId === conversationId && message.receiverId === authUser?._id) ||
          (message.receiverId === conversationId && message.senderId === authUser?._id));

      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
        if (message.senderId !== authUser?._id) {
          axios.put(`/api/messages/mark/${message._id}`).catch(() => {});
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, conversationId, authUser?._id, axios]);

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleSend = async () => {
    if (!conversationId || sending) return;
    if (!text.trim() && !imageFile) return;

    try {
      setSending(true);
      let image;
      if (imageFile) {
        image = await fileToBase64(imageFile);
      }
      const payload = { text: text.trim(), image };
      const { data } = await axios.post(`/api/messages/send/${conversationId}`, payload);
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
        setText("");
        setImageFile(null);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} className="max-w-16" alt="" />
        <p className="text-lg font-medium text-white">Chat anytime,anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser?.fullName}
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden max-w-7 cursor-pointer" />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      <div className="flex flex-col h-[calc(100%-140px)] overflow-y-scroll p-3 pb-6">
        {loadingMessages && <p className="text-sm text-gray-400">Loading messages...</p>}
        {!loadingMessages && messages.length === 0 && (
          <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isIncoming = msg.senderId === selectedUser._id;
          return (
            <div
              key={msg._id}
              className={`flex items-end gap-3 mb-3 ${isIncoming ? "justify-start" : "justify-end"}`}
            >
              {isIncoming ? (
                <>
                  <div className="text-center text-xs order-1">
                    <img
                      src={selectedUser?.profilePic || assets.profile_martin}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                    <p className="text-gray-500 mt-1">{formatMessageTime(msg.createdAt)}</p>
                  </div>
                  <div className="order-2">
                    {msg.image ? (
                      <img
                        src={msg.image}
                        alt=""
                        className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
                      />
                    ) : (
                      <p className="p-3 max-w-[220px] md:text-sm font-light rounded-lg bg-violet-500/30 text-white rounded-bl-none">
                        {msg.text}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="order-1">
                    {msg.image ? (
                      <img
                        src={msg.image}
                        alt=""
                        className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
                      />
                    ) : (
                      <p className="p-3 max-w-[220px] md:text-sm font-light rounded-lg bg-gray-700/30 text-white rounded-br-none">
                        {msg.text}
                      </p>
                    )}
                  </div>
                  <div className="text-center text-xs order-2">
                    <img src={authUser?.profilePic || assets.avatar_icon} alt="" className="w-7 h-7 rounded-full" />
                    <p className="text-gray-500 mt-1">{formatMessageTime(msg.createdAt)}</p>
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          {imageFile && (
            <span className="text-[10px] text-gray-300 mr-2 truncate max-w-[120px]">{imageFile.name}</span>
          )}
          <input
            type="file"
            id="image"
            accept="image/png,image/jpeg"
            hidden
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <button onClick={handleSend} disabled={sending} className="disabled:opacity-60">
          <img src={assets.send_button} alt="" />
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
