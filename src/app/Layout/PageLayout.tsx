// PageLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./StaticLayout/SideBar";
import RightBar from "./StaticLayout/RightBar";
import Burgermenu from "../pages/Dashboard/Burgermenu";



const PageLayout: React.FC = () => {


  return (
    <div className="flex h-screen bg-gray-50  overflow-hidden">
      <SideBar />

      <main className="flex-1 flex flex-col px-8 py-6 overflow-hidden">
        <div className="flex-1">
        <Burgermenu/>
          <Outlet />
        </div>
      </main>

      <RightBar />
    </div>
  );
};

export default PageLayout;
