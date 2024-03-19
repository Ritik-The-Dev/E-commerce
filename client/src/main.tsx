import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/app.scss";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { RecoilRoot } from "recoil";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <RecoilRoot>
    <Provider store={store}>
      <App />
    </Provider>
      </RecoilRoot>
  </React.StrictMode>
);
