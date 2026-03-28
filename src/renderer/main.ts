import { createApp } from "vue";
import { ipcRenderer } from "electron";
import { createPinia } from 'pinia'

import App from "./App.vue";
import router from "./router";
import SvgIcon from "@renderer/components/SvgIcon/index.vue";
import ArcoVue from '@arco-design/web-vue';

import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';

import { errorHandler } from "./error";
import "./icons";
import "@renderer/styles/tailwind.css";

if (!process.env.IS_WEB) {
  ipcRenderer.invoke("IsUseSysTitle").then((res) => {
    if (!res) {
      require("@renderer/styles/custom-title.scss");
    }
  });
}
const pinia = createPinia()
const app = createApp(App);

app.use(pinia)
app.use(router);
app.use(ArcoVue);
app.use(ArcoVueIcon);

errorHandler(app);

app.component("svg-icon", SvgIcon);
app.mount("#app");
