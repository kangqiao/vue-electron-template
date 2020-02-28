/* Created by zhaopan on 2020/2/26. */
const log = require("electron-log")
log.transports.file.level = "debug"

const isDev = process.env.NODE_ENV === 'development'
//是否开启调试模式
const isDebug = true//process.argv.includes('--debug')

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

const names = {
  LAUNCH: 'launch',
  MAIN: 'main',
  SETTINGS: 'settings',
  NEW_PAGE: 'newPage'
}

const events = {
  APP_QUIT: 'app-quit',
  LOG_MESSAGE: 'log-message',
}

const channels = {

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
  isDev,
  isDebug,
  names,
  events,
  channels,
  installDevTools,
  setMainWindow,
  sendMainMessage,
  logOnMainWindow,
  logInfo,
}
