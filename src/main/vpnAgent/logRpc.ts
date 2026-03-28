const { BrowserWindow } = require('electron')

function logSend(data: any) {
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('vpnagent-log', data)
    })
}

function logSendErr(data: any) {
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('vpnagent-log-err', data)
    })
}

export {
    logSend, logSendErr
}