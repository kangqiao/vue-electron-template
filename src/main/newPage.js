import { BrowserWindow, ipcMain, screen } from 'electron'

const isDev = process.env.NODE_ENV === 'development'
let win

/**
 * 创建新窗口函数
 */
function createNewPageWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 180,
    minWidth: 500,
    minHeight: 130,
    type: 'toolbar', // 创建的窗口类型为工具栏窗口
    frame: false, // 要创建无边框窗口
    movable: true, // 窗口是否可以移动
    show: false, // 先不让窗口显示
    webPreferences: {
      devTools: true, // 关闭调试工具
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webSecurity: false,
      webviewTag: true,
    },
    useContentSize: true,
  });
  const size = screen.getPrimaryDisplay().workAreaSize; // 获取显示器的宽高
  const winSize = win.getSize(); // 获取窗口宽高
  // 设置窗口的位置 注意x轴要桌面的宽度 - 窗口的宽度
  win.setPosition((size.width - winSize[0]) / 2, 350);

  if (isDev) {
    win.loadURL('http://localhost:9080/newPage')
  } else {
    win.loadFile(`${__dirname}/newPage/index.html`)

    global.__static = require('path')
      .join(__dirname, '/static')
      .replace(/\\/g, '\\\\')
  }

  // 监听渲染完成
  win.on('ready-to-show', () => {
    win.show()
    win.focus()
  });
  // 监听窗口关闭
  win.on('closed', () => {
    console.log('new Page closed')
  });

}

/**
 * 监听创建新窗口
 */
ipcMain.on('showNewPageWindow', () => {
  if (win) {
    win.show();
  } else {
    createNewPageWindow();
  }
});

/**
 * 监听隐藏新窗口
 */
ipcMain.on('hideNewPageWindow', () => {
  if (win) {
    win.hide();
  }
});
