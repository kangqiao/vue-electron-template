import { app, BrowserWindow, Menu } from 'electron'
import {isDev, events } from './constants'
import {sendMainMessage, logInfo} from './utils'


let mainWindow
let forceQuit = false

function createMainWindow(param, listener) {
  const name = param.name
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    backgroundColor: '#fff',
    width: 960,
    height: 540,
    minWidth: 960,
    minHeight: 540,
    // useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webSecurity: false,
      webviewTag: true,
      //contextIsolation: true
    },
    show: false,
    transparent: true,
    title: name,
  })

  if (listener && listener.onCreated) {
    listener.onCreated(mainWindow)
  }

  // eslint-disable-next-line
  setMenu()

  // load root file/url
  if (isDev) {
    mainWindow.loadURL('http://localhost:9080/main')
  } else {
    mainWindow.loadFile(`${__dirname}/main/index.html`)

    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }

  // Show when loaded
  mainWindow.on('ready-to-show', () => {
    // mainWindow.show()
    // mainWindow.focus()
    if (listener && listener.onLoaded) {
      listener.onLoaded(mainWindow)
    }
  })

  mainWindow.on('closed', () => {
    logInfo('main window closed!')
    if (listener && listener.onDestroyed) {
      listener.onDestroyed(name)
    }
  })

  /**
   * 解决点击左上角x最小化，点击dock退出
   * https://stackoverflow.com/questions/35008347/electron-close-w-x-vs-right-click-dock-and-quit
   */
  app.on('before-quit', function() {
    forceQuit = true
  })
  /**
   * 解决mac下点击关闭按钮最小化
   * https://github.com/electron/electron/blob/v1.2.6/docs/api/browser-window.md#event-close
   * https://discuss.atom.io/t/object-has-been-destroyed-when-open-secondary-child-window/30880/3
   * https://electronjs.org/docs/api/browser-window
   */
  mainWindow.on('close', (e) => {
    if (process.platform === 'darwin') {
      //针对Mac平台,
      // 1. 如果不是forceQuit强制退出,
      //   1.1 判断是全屏->退出全屏
      //   1.2 判断不是全屏->隐藏窗口, 阻止退出事件向下传递
      // 2. 如果是强制退出, 发送'app-quit'事件通知渲染进程处理退出逻辑.
      if (!forceQuit) {
        if (mainWindow.isFullScreen()){
          mainWindow.setFullScreen(false)
        } else {
          forceQuit = false
          mainWindow.hide()
          //mainWindow.minimize() //窗口最小化。在某些平台上, 最小化的窗口将显示在Dock中.
          e.preventDefault()		//阻止默认行为，一定要有
        }
      } else {
        sendMainMessage(events.APP_QUIT)
      }
    } else {
      sendMainMessage(events.APP_QUIT)
      app.quit()
      process.exit(0)
    }
  })

  return mainWindow
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

const sendMenuEvent = async data => {
  if (mainWindow){
    mainWindow.webContents.send('change-view', data)
  }
}

const template = [
  {
    label: app.getName(),
    submenu: [
      {
        label: 'Home',
        accelerator: 'CommandOrControl+H',
        click() {
          sendMenuEvent({ route: '/' })
        },
      },
      { type: 'separator' },
      { role: 'minimize' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { role: 'quit', accelerator: 'Alt+F4' },
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Get Help',
        role: 'help',
        accelerator: 'F1',
        click() {
          sendMenuEvent({ route: '/help' })
        },
      },
      {
        label: 'About',
        role: 'about',
        accelerator: 'CommandOrControl+A',
        click() {
          sendMenuEvent({ route: '/about' })
        },
      },
    ],
  },
]

function setMenu() {
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    })

    // @ts-ignore
    template.push({
      role: 'window',
    })

    // @ts-ignore
    template.push({
      role: 'help',
    })

    // @ts-ignore
    template.push({ role: 'services' })
  }

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

export default createMainWindow
