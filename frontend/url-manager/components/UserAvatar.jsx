import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const UserAvatar = () => {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative group inline-block">
      {/* Avatar Circle */}
      <img
        src={user.picture}
        alt={user.name}
        className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-md cursor-pointer"
      />

      {/* Tooltip Pinpoint */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="relative bg-white text-sm text-gray-800 p-2 rounded-lg shadow-lg border w-max">
          <div className="font-semibold">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
          {/* Pin/Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-300 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default UserAvatar;
