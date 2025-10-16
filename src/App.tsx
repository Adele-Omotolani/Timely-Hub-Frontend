// App.tsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFound from "./app/pages/NotFound";
import LandingPage from "./app/pages/LandingPage/LandingPage";
import Login from "./app/pages/AuthPages/login";
import Signup from "./app/pages/AuthPages/sigin";
import AllScreen from "./app/pages/Dashboard/AllScreen";

import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routes/ProtectedRoutes";
import ForgotPassword from "./app/pages/AuthPages/forgotPassword";
import ResetPassword from "./app/pages/AuthPages/ResetPassword";
import EmailVerification from "./app/pages/AuthPages/EmailVerification";


const App: React.FC = () => {


  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<Signup />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/*" element={<AllScreen />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
