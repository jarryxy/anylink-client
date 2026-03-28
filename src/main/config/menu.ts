//  https://electronjs.org/docs/api/menu
import { dialog } from "electron";
import { type, arch, release } from "os";
import packageInfo from "../../../package.json";

const menu = [
  {
    label: "设置",
    submenu: [
      {
        label: "退出",
        accelerator: "CmdOrCtrl+F4",
        role: "close",
      },
    ],
  },
  {
    label: "帮助",
    submenu: [
      {
        label: "关于",
        click: function () {
          info();
        },
      },
    ],
  },
];
function info() {
  dialog.showMessageBox({
    title: "关于",
    type: "info",
    message: "Anylink Client",
    detail: `版本信息：${packageInfo.version}\n引擎版本：${
      process.versions.v8
    }\n当前系统：${type()} ${arch()} ${release()}`,
    noLink: true,
  });
}

export default menu;
