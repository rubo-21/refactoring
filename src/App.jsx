import { useState } from "react";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import GdprUpdatePassword from "./GdprUpdatePassword.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  const [redirect] = useState("www.google.com");
  const [company] = useState("Google");

  return (
    <>
      <GdprUpdatePassword redirect={redirect} company={company} />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition="Bounce"
      />
    </>
  );
}

export default App;
