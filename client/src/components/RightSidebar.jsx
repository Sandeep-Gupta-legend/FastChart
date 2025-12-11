import React from "react";
import assets from "../assets/assets";

const RightSidebar = ({ selectedUser }) => {
  if (!selectedUser) return null;

  return (
    <div
      className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        {/* Profile Picture */}
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="Profile"
          className="w-20 aspect-square rounded-full"
        />

        {/* Name + Online Dot */}
        <div className="flex items-center gap-2 text-xl font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>{selectedUser.fullName}</span>
        </div>

        {/* Bio */}
        {selectedUser.bio && (
          <p className="px-10 text-center text-sm opacity-80">
            {selectedUser.bio}
          </p>
        )}
      </div>
      <hr className="border-[#ffffff50] my-4"/>
      <div className="px-5 text-xs">
        <p>Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">

        </div>

      </div>
    </div>
  );
};

export default RightSidebar;
