import { logSend, logSendErr } from "./logRpc";
import { app } from "electron";
const fs = require("fs");
const path = require("path");
const sudo = require("sudo-prompt");

function getAgentName() {
  const platform = process.platform;
  const arch = process.arch;
  let agentName = "";
  const binName = "anylink_client_agent";
  if (platform === "win32") {
    if (arch === "x64") {
      agentName = `${binName}-windows-amd64.exe`;
    } else if (arch === "ia32") {
      agentName = `${binName}-windows-386.exe`;
    } else if (arch === "arm64") {
      agentName = `${binName}-windows-arm64.exe`;
    }
  } else if (platform === "darwin") {
    if (arch === "x64") {
      agentName = `${binName}-darwin-amd64`;
    } else if (arch === "arm64") {
      agentName = `${binName}-darwin-arm64`;
    }
  } else if (platform === "linux") {
    if (arch === "x64") {
      agentName = `${binName}-linux-amd64`;
    } else if (arch === "arm64") {
      agentName = `${binName}-linux-arm64`;
    } else if (arch === "ia32") {
      agentName = `${binName}-linux-386`;
    } else if (arch === "arm") {
      agentName = `${binName}-linux-arm`;
    }
  }
  return agentName;
}

function getBinPath() {
  const isPackaged = app.isPackaged;
  let binPath: string;
  let agentName: string;
  const platform = process.platform;

  if (isPackaged) {
    agentName = "anylink_client_agent";
  if (platform === "win32") {
    agentName = "anylink_client_agent.exe";
  }
    binPath = path.join(process.resourcesPath, "bin", agentName);
  } else {
    agentName = getAgentName();
    binPath = path.resolve(
      path.join(__dirname, "../../../", "vpnagent", agentName),
    );
  }
  if (!fs.existsSync(binPath)) {
    throw new Error(`${agentName} not found at: ${binPath}`);
  }
  if (platform !== "win32") {
    fs.chmodSync(binPath, 0o755);
  }

  return binPath;
}
const vpnagent = getBinPath();

const execName = "Anylink Client agent";
export default {
  InstallVpnAgent() {
    return new Promise((resolve, reject) => {
      sudo.exec(
        vpnagent + " install",
        {
          name: execName,
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            logSendErr(error);
            reject(error);
          }
          if (stderr) {
            logSendErr(stderr);
            reject(stderr);
          }
          logSend(stdout);
          resolve(stdout);
        },
      );
    });
  },
  UnInstallVpnAgent() {
    return new Promise((resolve, reject) => {
      sudo.exec(
        vpnagent + " uninstall",
        {
          name: execName,
        },
        (error, stdout, stderr) => {
          if (error) {
            logSendErr(error);
            reject(error);
          }
          if (stderr) {
            logSendErr(stderr);
            reject(stderr);
          }
          logSend(stdout);
          resolve(stdout);
        },
      );
    });
  },
  ReInstallVpnAgent() {
    return new Promise((resolve, reject) => {
      sudo.exec(
        vpnagent + " reinstall",
        {
          name: execName,
        },
        (error, stdout, stderr) => {
          if (error) {
            logSendErr(error);
            reject(error);
          }
          if (stderr) {
            logSendErr(stderr);
            reject(stderr);
          }
          logSend(stdout);
          resolve(stdout);
        },
      );
    });
  },
};
