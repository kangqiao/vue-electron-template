/* Created by zhaopan on 2020/2/26. */
import { BrowserWindow, screen } from 'electron'
import { isDev} from './constants'
import {logInfo} from './utils'

/**
 * 创建定制化的新窗口函数
 */
function customWindow(param, listener) {
  logInfo('customWindow(param:' + JSON.stringify(param) + ')')
  const {name, path, option} = param

  const defOption = {
    width: 420,
    height: 250,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      webviewTag: true,
    },
    //type: 'toolbar', // 创建的窗口类型为工具栏窗口
    resizable: true, //窗口是否可以改变尺寸
    movable: true, // 窗口是否可以移动
    show: false, // 先不让窗口显示
    //focus: true,
    frame: true, // false=创建无边框窗口
    center: true,
    transparent: false,
    titleBarStyle: 'hidden',
    useContentSize: false,
    backgroundColor: '#131625',
    title: name,
  }
  if (process.platform !== 'darwin') {
    defOption.show = false
    defOption.frame = true
    defOption.autoHideMenuBar = true
    defOption.transparent = false
    defOption.icon = `${global.__static}/icon.png`
  }

  let options = Object.assign(defOption, option)

  let window = new BrowserWindow(options)

  if (listener && listener.onCreated) {
    listener.onCreated(window)
  }

  /*
  // 获取显示器的宽高
  const size = screen.getPrimaryDisplay().workAreaSize;
  const winSize = window.getSize(); // 获取窗口宽高
  // 设置窗口的位置 注意x轴要桌面的宽度 - 窗口的宽度
  window.setPosition((size.width - winSize[0]) / 2, 350);
  */

  //设置路径
  let routePath = ''
  if (name) {
    routePath += name
  }
  if (path) {
    routePath += '/' + path
  } else {
    routePath += '/index.html'
  }

  if (isDev) {
    window.loadURL('http://localhost:9080/' + routePath)
  } else {
    window.loadFile(`${__dirname}/${routePath}`)
    window.routerPath = routePath

    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }

  // 监听渲染完成
  window.on('ready-to-show', () => {
    //window.show()
    //window.focus()
    if (listener && listener.onLoaded) {
      listener.onLoaded(window)
    }
  })

  // 监听窗口关闭
  window.on('closed', () => {
    logInfo('custom window (' + name + ') closed!')
    if (listener && listener.onDestroyed) {
      listener.onDestroyed(name)
    }
  })

  return window
}

export default customWindow
