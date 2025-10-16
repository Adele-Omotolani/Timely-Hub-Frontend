import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../Components/Button";
// import Defaultquizpage from "./Defaultquizpage";

// import Defaultquizpage from "./Defaultquizpage";

const Homequizpage: React.FC = () => {
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() === "") {
      navigate("/dashboard/quiz"); // stays here if empty
    } else {
      localStorage.setItem("playerName", playerName.trim());
      navigate("/dashboard/quiz-setup"); // ✅ go to Defaultquizpage next
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4">
      <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-12 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#102844] mb-3 md:mb-4">
            Quiz Challenge
          </h1>
          <p className="text-[#767278] mb-6 md:mb-8 text-sm md:text-lg">
            Test your knowledge and compete for the top spot!
          </p>

          <form onSubmit={handleNameSubmit} className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-2xl font-semibold text-[#102844]">
              Enter Your Name
            </h3>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3  text-[#767278]   border-2  placeholder-gray-300 outline-0 border-gray-300 rounded-xl text-sm md:text-lg"
              required
            />
            <div className="flex gap-3 md:gap-4">
              <Button text="Continue" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Homequizpage;
