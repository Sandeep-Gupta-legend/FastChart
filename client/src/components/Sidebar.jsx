import React, { useContext, useEffect, useMemo, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const { logout, axios, onlineUsers, socket, authUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [unseen, setUnseen] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/messages/users");
        if (data.success) {
          setUsers(data.users);
          setUnseen(data.unseenMessages || {});
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchUsers();
  }, [axios]);

  useEffect(() => {
    if (!selectedUser) return;
    setUnseen((prev) => {
      if (prev[selectedUser._id]) {
        const clone = { ...prev };
        delete clone[selectedUser._id];
        return clone;
      }
      return prev;
    });
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;
    const handleIncoming = (message) => {
      if (message.receiverId !== authUser?._id) return;
      if (message.senderId === selectedUser?._id) {
        setUnseen((prev) => {
          if (!prev[message.senderId]) return prev;
          const clone = { ...prev };
          delete clone[message.senderId];
          return clone;
        });
        return;
      }
      setUnseen((prev) => ({
        ...prev,
        [message.senderId]: (prev[message.senderId] || 0) + 1,
      }));
    };
    socket.on("newMessage", handleIncoming);
    return () => socket.off("newMessage", handleIncoming);
  }, [socket, selectedUser, authUser?._id]);

  const filtered = useMemo(() => {
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const isOnline = (id) => onlineUsers?.some((u) => String(u) === String(id));

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="logo" className="max-h-5 cursor-pointer" />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p onClick={() => navigate("/profile")} className="cursor-pointer text-sm">
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p className="cursor-pointer text-sm" onClick={() => logout()}>
                Logout
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      <div className="flex flex-col">
        {filtered.map((user) => (
          <div
            onClick={() => setSelectedUser(user)}
            key={user._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id && "bg-[#282142]/50"
            }`}
          >
            <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-[35px] aspect-square rounded-full" />
            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              {isOnline(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>
            {unseen[user._id] && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseen[user._id]}
              </p>
            )}
          </div>
        ))}

        {!filtered.length && <p className="text-xs text-gray-300 px-2">No users found</p>}
      </div>
    </div>
  );
};

export default Sidebar;
