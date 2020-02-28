/* Created by zhaopan on 2020/2/28. */
import {events, isDebug} from './constants'

const log = require("electron-log")
log.transports.file.level = "debug"

let mainWindow

function setMainWindow(window) {
  mainWindow = window
}

async function installDevTools() {
  try {
    /* eslint-disable */
    require('devtron').install()
    require('vue-devtools').install()
    /* eslint-enable */
  } catch (err) {
    console.log(err)
  }
}


//向主窗口发送事件
function sendMainMessage(event, data) {
  if (mainWindow) {
    mainWindow.webContents.send(event, data)
  }
}

function logOnMainWindow(msg) {
  if (isDebug) {
    sendMainMessage(events.LOG_MESSAGE, msg)
  }
}

function logInfo(msg) {
  log.info(msg)
  if (isDebug) {
    logOnMainWindow(msg)
  }
}

export {
  installDevTools,
  setMainWindow,
  sendMainMessage,
  logOnMainWindow,
  logInfo,
}
