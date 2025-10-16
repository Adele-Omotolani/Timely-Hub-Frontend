import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../../../assets/Frame 8687 (1).png";
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import { BsChatSquareText } from "react-icons/bs";
import { IoDocumentTextOutline } from "react-icons/io5";
import SignOutModal from "../../pages/AuthPages/logoutModal";
import { MdOutlineQuiz } from "react-icons/md";
import { AiOutlineSchedule } from "react-icons/ai";
import { GoHistory } from "react-icons/go";
import { HiMenuAlt3, HiX } from "react-icons/hi"; // Burger menu icons

const Burgermenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Manage sidebar state
    const [showLogoutModal, setShowLogoutModal] = useState(false);
  

  return (
    <>
      {/* Hamburger button - visible only on small screens */}
      <div className="fixed  z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white text-green-700 shadow-md md:hidden block border"
        >
          {isOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </div>

     
      <aside
        className={`fixed top-0 left-0 h-full w-[70%] sm:w-[18%] md:hidden block bg-white border-r border-gray-100 flex-col py-6 px-4 z-40 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`} // Sidebar slides in when isOpen is true
      >
        <div className="flex items-center mb-8">
          <img
            src={Logo}
            alt="Logo"
            className="w-[125px] h-[40px] mt-12 mr-2 object-fill"
          />
        </div>

        <nav className="flex-1">
          <ul className="space-y-4">
            <NavLink
                          to="/dashboard"
                          className={({ isActive }) =>
                            isActive
                              ? "bg-green-100 text-green-700 font-semibold rounded-lg"
                              : "text-gray-600 hover:bg-green-100 hover:text-green-700"
                          }
                        >
                          <li className="flex items-center px-3 py-2 hover:bg-green-100 rounded-lg  cursor-pointer transition duration-300">
                            <AiOutlineSchedule  className="mr-2" />
                            <span>My Schedule</span>
                          </li>
                        </NavLink>

            <NavLink
              to="/dashboard/chat"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "bg-green-100 text-green-700 font-semibold rounded-lg"
                  : "text-gray-600 hover:text-green-700"
              }
            >
              <li className="flex items-center px-3 py-2 cursor-pointer transition duration-300">
                <BsChatSquareText size={15} className="mr-2" />
                <span className="text-[18px]">Ai Chat</span>
              </li>
            </NavLink>

            <NavLink
              to="/dashboard/upload"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "bg-green-100 text-green-700 font-semibold rounded-lg"
                  : "text-gray-600 hover:text-green-700"
              }
            >
              <li className="flex items-center px-3 py-2 cursor-pointer transition duration-300">
                <IoDocumentTextOutline size={15} className="mr-2" />
                <span className="text-[18px]">Uploads</span>
              </li>
            </NavLink>

            <NavLink
              to="/dashboard/quiz"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "bg-green-100 text-green-700 font-semibold rounded-lg"
                  : "text-gray-600 hover:text-green-700"
              }
            >
              <li className="flex items-center px-3 py-2 cursor-pointer transition duration-300">
                <MdOutlineQuiz size={15} className="mr-2" />
                <span className="text-[18px]">Quiz</span>
              </li>
            </NavLink>

            <NavLink
              to="/dashboard/history"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "bg-green-100 text-green-700 font-semibold rounded-lg"
                  : "text-gray-600 hover:text-green-800"
              }
            >
              <li className="flex items-center px-3 py-2 cursor-pointer transition duration-300">
                <GoHistory size={15} className="mr-2" />
                <span>History</span>
              </li>
            </NavLink>

            <NavLink
              to="/dashboard/setting"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "bg-green-100 text-green-700 font-semibold rounded-lg"
                  : "text-gray-600 hover:text-green-800"
              }
            >
              <li className="flex items-center px-3 py-2 cursor-pointer transition duration-300">
                <IoSettingsOutline size={15} className="mr-2" />
                <span>Setting</span>
              </li>
            </NavLink>
            <li
              className="flex items-center px-3 py-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg cursor-pointer transition duration-300"
              onClick={() => setShowLogoutModal(true)}
            >
              <IoLogOutOutline className="mr-2" />
              <span>Logout</span>
            </li>
          </ul>
        </nav>
      </aside>
      {showLogoutModal && (
        <SignOutModal onClose={() => setShowLogoutModal(false)} />
      )}
    </>
  );
};

export default Burgermenu;
