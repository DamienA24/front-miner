import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import "./App.css";

function getLibrary(provider) {
  return new Web3Provider(provider);
}
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <App />
  </Web3ReactProvider>
);
