import { app, ipcMain } from 'electron'
const log = require("electron-log")
import {MAIN, isDev, isDebug, installDevTools} from './constants'
import { productName } from '../../package.json'
import createMainWindow from './main'
import customWindow from './custom_window'

log.transports.file.level = "debug"
// set app name
app.setName(productName)

// disable electron warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

var windowsManager = {}
let mainWindow

//app.requestSingleInstanceLock()指示应用程序实例锁定成功与否，
// 当无法成功锁定时，可能是应用程序的另一个实例正在执行, 此时应当结束当前实例。
const gotTheLock = app.requestSingleInstanceLock()
// only allow single instance of application
if (!isDev) {
  if (gotTheLock) {
    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.focus()
      }
    })
  } else {
    app.quit()
    process.exit(0)
  }
} else {
  require('electron-debug')({
    showDevTools: !(process.env.RENDERER_REMOTE_DEBUGGING === 'true'),
  })
}

app.on('ready', () => {
  let window = newWindow(MAIN, null, null)

  if (isDev) {
    installDevTools()
  }

  if (isDebug) {
    if (window) {
      window.webContents.openDevTools()
    }
  }
})

app.on('window-all-closed', () => {
  log.info('app.on(\'window-all-closed\') ')
  if (process.platform !== 'darwin') {
    //通知主窗口应用程序退出事件
    sendMainMessage('app-quit')
    app.quit()
  }
})

app.on('activate', () => {
  log.info('app.on(\'active\') mainWindow=' + (mainWindow === null))
  if (mainWindow === null) {
    //createMainWindow()
    newWindow(MAIN, null, null)
  }
})

//创建新窗口
function newWindow(name, path, option, listener) {
  if (!name) {
    log.warn('new window failed!!! name=' + name)
    return
  }

  let newWin
  if (name === MAIN) {
    mainWindow = createMainWindow({name, path, option}, {
      onCreated(window) {
        log.info('main window created!')
        // todo 调整主窗口
      },
      onLoaded(window) {
        log.info('main window loaded!')
        window.show()
        window.focus()
      },
      onDestroyed(name) {
        // 主窗口被关闭
        //windowsManager[name] = null
      }
    })
    newWin = mainWindow
    windowsManager[MAIN] = mainWindow
  } else {
    // 创建新窗口
    newWin = customWindow({name, path, option}, {
      onCreated(window) {
        log.info('custom window (' + name + ') created!')
        // 调整子窗口大小,......
        if (listener && listener.onCreated) listener.onCreated(window)
      },
      onLoaded(window) {
        log.info('custom window (' + name + ') loaded!')
        window.show()
        window.focus()
        if (listener && listener.onLoaded) listener.onLoaded(window)
      },
      onDestroyed(name) {
        log.info('custom window (' + name + ') destroyed!')
        // 说明窗口已经被关闭.
        windowsManager[name] = null
        if (listener && listener.onDestroyed) listener.onDestroyed(name)
      }
    })
    windowsManager[name] = newWin
  }

  return newWin
}

// 关闭并清除name指定的窗口
function cleanWindows(name) {
  if (windowsManager[name]) {
    if (!windowsManager[name].isDestroyed()) {
      windowsManager[name].destroy()
    } else {
      windowsManager[name] = null
    }
  }
}

// 关闭除MAIN主窗口外的其他窗口
function cleanAllWindows() {
  for (let key in windowsManager) {
    if (key != MAIN) {
      cleanWindows(key)
    }
  }
}

//向主窗口发送事件
function sendMainMessage(event, data) {
  if (mainWindow) {
    mainWindow.webContents.send(event, data)
  }
}

//---------------------------------//
//--------主进程监听窗口事件--------//
//---------------------------------//

// 显示窗口, 如果不存在则为其创建
ipcMain.on('showOrNewWindow', (event, args) => {
  log.info('showOrNewWindow args=' +  JSON.stringify(args))
  const {name, path, option} = args
  if (windowsManager[name]) {
    log.info('showOrNewWindow window=' + windowsManager[name])
    windowsManager[name].show();
  } else {
    newWindow(name, path, option)
  }
});

// 隐藏窗口
ipcMain.on('hideWindow', (event, args) => {
  log.info('hideWindow args=' +  JSON.stringify(args))
  const name = args.name
  if (windowsManager[name]) {
    windowsManager[name].hide()
  }
});

// 关闭窗口
ipcMain.on('closeWindow', (event, args) => {
  log.info('closeWindow args=' +  JSON.stringify(args))
  const name = args.name
  const force = args.force
  if (windowsManager[name]) {
    if (force) {
      windowsManager[name].destroy()
    } else {
      windowsManager[name].close()
    }
  }
})
