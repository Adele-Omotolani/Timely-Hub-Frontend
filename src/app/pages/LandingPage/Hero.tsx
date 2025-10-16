import React from "react";
import Button from "../../../Components/Button";
import HeroImage from "../../../assets/Group 2 (1).png";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full md:h-[400px] lg:h-[480px] h-auto lg:mt-[140px] md:mt-[80px] mt-[85px] flex justify-center items-center py-5">
      <div className="w-[85%] md:h-[440px] h-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6 lg:gap-10">
      
        <img
          src={HeroImage}
          alt="Hero"
          className="w-[400px] md:w-[280px] lg:w-[470px] h-auto block md:hidden"
        />

        <div className="flex flex-col gap-4 md:gap-3 lg:gap-6 max-w-[650px] text-center md:text-left">
          <h1 className="text-[#102844] font-inter font-bold text-[25px] md:text-[32px] lg:text-[48px] leading-tight md:leading-snug lg:leading-snug">
            Organize Your Study.
            <br />
            Achieve More.
          </h1>

          
          <p className="text-[#767278] font-poppins font-normal text-[14px] md:text-[15px] lg:text-[20px] leading-6 md:leading-7 lg:leading-8 hidden md:block">
            Stay on top of your study schedule with ease.{" "}
            <br className="hidden md:inline lg:flex" /> Organize and manage all
            your learning materials in one place.{" "}
            <br className="hidden lg:flex" />
            Boost your focus and productivity with smart tools built for
            students. <br className="hidden lg:flex" />
            Learn better, stay consistent, and achieve more every day.
          </p>

          <div className="flex justify-center mt-2 md:justify-start md:mt-1 lg:mt-2">
            <Button text="Get Started" onClick={() => navigate("/signUp")} />
          </div>
        </div>

       
        <img
          src={HeroImage}
          alt="Hero"
          className="w-[200px] md:w-[280px] lg:w-[470px] h-auto hidden md:block"
        />
      </div>
    </div>
  );
};

export default Hero;
