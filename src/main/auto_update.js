import {app, ipcMain} from 'electron'

// 注意这个autoUpdater不是electron中的autoUpdater
import {autoUpdater} from 'electron-updater'
// 更新服务器地址，比如"http://**.**.**.**:3002/download/"
//import {uploadUrl} from "../renderer/config/config";
import {version} from '../../package.json'

const log = require("electron-log")
log.transports.file.level = "debug"
autoUpdater.logger = log
autoUpdater.autoInstallOnAppQuit = false


// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
const updateHandle = (mainWindow, url, channel) => {
  log.info('zp::: enter into updateHandle for windows register event of update')
  autoUpdater.removeAllListeners(["error", "checking-for-update", 'update-available', 'update-not-available', 'download-progress', 'update-downloaded'])
  ipcMain.removeAllListeners(['isUpdateNow', 'checkForUpdate'])

  let message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新',
  }
  //const os = require('os')
  autoUpdater.setFeedURL({
    provider: "generic",
    url: url,
    channel: channel
  })
  autoUpdater.on('error', function (error) {
    log.info('zp::: error ' + JSON.stringify(error))
    mainWindow.webContents.send('error', JSON.stringify(error))
  })
  autoUpdater.on('checking-for-update', function () {
    log.info('zp::: checking-for-update')
    sendUpdateMessage(message.checking)
  })
  autoUpdater.on('update-available', function (info) {
    log.info('zp::: update-available '+JSON.stringify(info))
    sendUpdateMessage(message.updateAva)
  })
  autoUpdater.on('update-not-available', function (info) {
    let notAvailableInfo = 'package.version=' + version + ', app.getVersion()=' + app.getVersion() + ', info=' + JSON.stringify(info)
    log.info('zp::: update-not-available ' + notAvailableInfo)
    //sendUpdateMessage('curVersion2=' + app.getVersion() + ', info=' + JSON.stringify(info))
    mainWindow.webContents.send('update-not-available', notAvailableInfo)
  })

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    log.info('zp::: download-progress ' + JSON.stringify(progressObj))
    mainWindow.webContents.send('downloadProgress', progressObj)
    //sendUpdateMessage('downloadProgress', + JSON.stringify(progressObj))
  })

  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    log.info('zp::: update-downloaded event=' + event
      + ', releaseNotes=' + releaseNotes
      + ', releaseName=' + releaseName
      + ', releaseDate=' + releaseDate
      + ', updateUrl=' + updateUrl
      + ', quitAndUpdate=' + quitAndUpdate
    )
    ipcMain.on('isUpdateNow', (e, arg) => {
      log.info('zp::: 下载完成, 确认安装!' + JSON.stringify(arg))
      //some code here to handle event
      autoUpdater.quitAndInstall()
    })

    //通知界面已经下载完成, 可以开始更新了.
    mainWindow.webContents.send('isUpdateNow')
  })

  ipcMain.on('checkForUpdate', () => {
    const printInfo = 'checkForUpdate package.version=' + version + ', app.getVersion=' + app.getVersion() + ', autoUpdater.version=' + JSON.stringify(autoUpdater.currentVersion)
    log.info('zp::: ' + printInfo)
    sendUpdateMessage(printInfo)
    //执行自动更新检查
    autoUpdater.checkForUpdates().then((result) => {
      log.info('zp::: checkForUpdateResult', result)
    })
  })

  // 通过main进程发送事件给renderer进程，提示更新信息
  function sendUpdateMessage(text) {
    mainWindow.webContents.send('message', text)
  }

  log.info('zp::: exist updateHandle for windows!!!')
}

export {
  updateHandle
}

