import {
  ipcMain,
  BrowserWindow,
  IpcMainInvokeEvent,
  app,
} from "electron";
import VpnAgent from "../vpnAgent";
const path = require("path");
const fs = require("fs");

const CONFIG_PATH = path.join(
  path.join(app.getPath("userData"), "anylink_client"),
  "config.json",
);

export default {
  Mainfunc(IsUseSysTitle: boolean) {
    ipcMain.handle(
      "IsUseSysTitle",
      async (event: IpcMainInvokeEvent, args: unknown) => {
        return IsUseSysTitle;
      },
    );

    ipcMain.handle("windows-mini", (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.minimize();
    });

    ipcMain.handle("window-max", async (event, args) => {
      if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
        BrowserWindow.fromWebContents(event.sender)?.unmaximize();
        return { status: false };
      } else {
        BrowserWindow.fromWebContents(event.sender)?.maximize();
        return { status: true };
      }
    });

    ipcMain.handle("window-close", (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.close();
    });

    ipcMain.handle("read-config", async () => {
      ensureConfigFile(CONFIG_PATH, JSON.stringify({}));
      try {
        const data = fs.readFileSync(CONFIG_PATH, "utf8");
        return JSON.parse(data);
      } catch (error) {
        throw error;
      }
    });

    ipcMain.handle("save-config", (event, config) => {
      try {
        if (typeof config !== "object") {
          throw new Error("配置必须是对象");
        }
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        return { success: true };
      } catch (error) {
        console.error("保存配置失败:", error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle("install-vpnagent", () => {
      return VpnAgent.InstallVpnAgent();
    });
    ipcMain.handle("uninstall-vpnagent", () => {
      return VpnAgent.UnInstallVpnAgent();
    });
    ipcMain.handle("reinstall-vpnagent", () => {
      return VpnAgent.ReInstallVpnAgent();
    });
    ipcMain.handle("get-userData", () => {
      return app.getPath("userData");
    });
  },
};

function ensureConfigFile(configPath, content) {
  try {
    try {
      fs.accessSync(configPath);
      console.log("配置文件已存在");
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        const dir = path.dirname(configPath);

        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, content);
        console.log("配置文件创建成功");
        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("操作失败:", error.message);
    return false;
  }
}
