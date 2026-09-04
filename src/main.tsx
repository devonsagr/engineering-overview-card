import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EngineeringControlRoom } from "./engineering/EngineeringControlRoom";
import "./engineering/engineering.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EngineeringControlRoom />
  </StrictMode>,
);
