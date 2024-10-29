import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Sender } from "./components/Sender";

import { Reciver } from "./components/Reciver";
import "./index.css";
import { Opt } from "./components/Opt";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Opt />} />
        <Route path="/sender" element={<Sender />} />
        <Route path="/reciver" element={<Reciver />} />
      </Routes>
    </BrowserRouter>
  );
};
