import { app, ipcMain } from 'electron'
import {isDebug, isDev, names, events, channels, installDevTools, setMainWindow, logInfo} from './constants'
import { productName } from '../../package.json'
import createMainWindow from './main'
import customWindow from './custom_window'

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
  newWindow(names.MAIN, null, null)

  if (isDev) {
    installDevTools()
  }
})

app.on('window-all-closed', () => {
  logInfo('app.on(\'window-all-closed\') ')
  if (process.platform !== 'darwin') {
    //通知主窗口应用程序退出事件
    sendMainMessage(events.APP_QUIT)
    app.quit()
  }
})


app.on('activate', () => {
  logInfo('app.on(\'active\') mainWindow=' + (mainWindow === null))
  if (mainWindow === null) {
    //createMainWindow()
    newWindow(names.MAIN, null, null)
  } else {
    if (mainWindow != null) {
      mainWindow.show()
    }
  }
})

//---------------------------------//
//--------窗口管理公共函数----------//
//---------------------------------//
//创建新窗口
function newWindow(name, path, option, listener) {
  if (!name) {
    logInfo('new window failed!!! name=' + name)
    reurn
  }

  let newWin
  if (name === names.MAIN) {
    mainWindow = createMainWindow({name}, {
      onCreated(window) {
        logInfo('main window created!')
        // 设置MainWindow
        setMainWindow(window)
        window.setBackgroundColor('#131625')
        if (isDebug) {
          if (window) {
            window.webContents.openDevTools()
          }
        }
      },
      onLoaded(window) {
        logInfo('main window loaded!')
        window.setBackgroundColor('#131625')
        window.center()
        window.show()
        window.focus()
      },
      onDestroyed(name) {
        // 主窗口被关闭
        //windowsManager[name] = null
      }
    })
    newWin = mainWindow
    windowsManager[names.MAIN] = mainWindow
  } else {
    // 创建新窗口
    newWin = customWindow({name, path, option}, {
      onCreated(window) {
        logInfo('custom window (' + name + ') created!')
        // 调整子窗口大小,......
        if (listener && listener.onCreated) listener.onCreated(window)

        if (isDebug) {
          if (window) {
            window.webContents.openDevTools()
          }
        }
      },
      onLoaded(window) {
        logInfo('custom window (' + name + ') loaded!')
        window.show()
        window.focus()
        if (listener && listener.onLoaded) listener.onLoaded(window)
      },
      onDestroyed(name) {
        logInfo('custom window (' + name + ') destroyed!')
        // 说明窗口已经被关闭.
        windowsManager[name] = null
        if (listener && listener.onDestroyed) listener.onDestroyed(name)
      }
    })
    windowsManager[name] = newWin
  }

  return newWin
}

function showMainWindow (isNewIfNoExist) {
  let window = windowsManager[names.MAIN]
  if (window) {
    window.show()
  } else if (isNewIfNoExist) {
    newWindow(names.MAIN, '', null)
  }
}

// 关闭并清除name指定的窗口
function closeWindows(name) {
  if (windowsManager[name]) {
    if (!windowsManager[name].isDestroyed()) {
      windowsManager[name].destroy()
    } else {
      windowsManager[name] = null
    }
  }
}

// 关闭除MAIN主窗口外的其他窗口
function closeAllWindows() {
  for (let key in windowsManager) {
    if (key != names.MAIN) {
      closeWindows(key)
    }
  }
}

//---------------------------------//
//--------主进程监听窗口事件--------//
//---------------------------------//

// 显示窗口, 如果不存在则为其创建
ipcMain.on('showOrNewWindow', (event, args) => {
  logInfo('showOrNewWindow args=' +  JSON.stringify(args))
  const {name, path, option} = args
  if (windowsManager[name]) {
    logInfo('showOrNewWindow window=' + windowsManager[name])
    windowsManager[name].show();
  } else {
    newWindow(name, path, option)
  }
});

// 隐藏窗口
ipcMain.on('hideWindow', (event, args) => {
  logInfo('hideWindow args=' +  JSON.stringify(args))
  const name = args.name
  if (windowsManager[name]) {
    windowsManager[name].hide()
  }
});

// 关闭窗口
ipcMain.on('closeWindow', (event, args) => {
  logInfo('closeWindow args=' +  JSON.stringify(args))
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
