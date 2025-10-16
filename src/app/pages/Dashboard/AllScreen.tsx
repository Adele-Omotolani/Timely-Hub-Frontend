import React from "react";
import { Route, Routes } from "react-router-dom";
import PageLayout from "../../Layout/PageLayout";
import MySchedule from "./MySchedule";
import AiChat from "./AiChat";

import Setting from "./Settings";
import Logout from "../AuthPages/logoutModal";
import SetReminder from "./SetReminder";
import History from "./History";
// import Homequizpage from "./quiz/Home";
import QuizSetup from "./quiz/QuizSetup";
import Quiz from "./quiz/quiz";
import UploadPage from "./UploadPage";


const AllScreen: React.FC = () => {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route index element={<MySchedule />} />
        <Route path="chat" element={<AiChat />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="upload-reminder" element={<SetReminder />} />
        {/* <Route path="quiz" element={<Homequizpage />} /> */}
        <Route path="quiz" element={<QuizSetup />} />
        <Route path="quizQuest" element={<Quiz />} />
        <Route path="history" element={<History />} />
        <Route path="setting" element={<Setting />} />
        <Route path="logout" element={<Logout onClose={() => {}}/>}/>
      </Route>
    </Routes>
  );
};

export default AllScreen;
