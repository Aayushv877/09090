// src/components/Layout.jsx
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar menuOpen={menuOpen} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          menuOpen ? "ml-48" : "ml-0"
        }`}
      >
        <Header toggleMenu={() => setMenuOpen(!menuOpen)} />
        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Adjust 64px if your Header height is different */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
