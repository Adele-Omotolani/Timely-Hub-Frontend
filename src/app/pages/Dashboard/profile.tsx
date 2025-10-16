import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/hooks";
import SignOutModal from "../../pages/AuthPages/logoutModal";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); 
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
   console.log(
     "Redux auth state:",
     useAppSelector((state) => state.auth)
   );

  const closeDropdown = () => setOpen(false);

  const handleSettingsClick = () => {
    navigate("/dashboard/setting");
    closeDropdown();
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [open]);

  return (
    <div className="p-1 bg-white" ref={dropdownRef}>
      <div className="relative flex items-center justify-between pb-4 gap-3">
        <div>
          <button
            onClick={() => setOpen(!open)}
            className="w-11 h-11 rounded-full cursor-pointer bg-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-haspopup="true"
            aria-expanded={open}
          >
            <span className="text-gray-700 font-semibold text-lg ">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-40 bg-white rounded-lg shadow-lg ring-1 ring-black/10 z-50">
              <ul className="py-2 text-sm text-gray-700">
                <li>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 font-['Poppins'] text-[15px]"
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <SignOutModal onClose={closeDropdown} />
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="w-[148px] h-[38px] flex items-center justify-baseline font-['Poppins'] font-medium text-[13.6px]">
          {user?.fullName || "Guest User"}
        </div>
      </div>
    </div>
  );
}
