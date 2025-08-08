// src/components/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "@aws-amplify/auth";
import VerifyEmailButton from "./VerifyEmailButton";

const Sidebar = ({ menuOpen }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div
      className={`bg-gray-800 text-white fixed top-0 left-0 h-screen transition-all duration-300 flex flex-col justify-between z-40 ${
        menuOpen ? "w-48 p-4" : "w-0 p-0"
      } overflow-hidden`}
    >
      {menuOpen && (
        <>
          <div className="flex flex-col gap-4 mt-16">
            {/* Adjust mt-16 if your Header overlaps */}
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-left"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/create-workspace")}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-left"
            >
              Create Workspace
            </button>
            <button
              onClick={() => navigate("/my-workspaces")}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 text-left"
            >
              My Workspaces
            </button>

            <div className="mt-2">
              <VerifyEmailButton />
            </div>
            
          </div>

          <button
            onClick={handleSignOut}
            className="mt-4 bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 text-left"
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  );
};

export default Sidebar;
