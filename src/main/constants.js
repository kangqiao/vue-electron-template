/* Created by zhaopan on 2020/2/26. */

const isDev = process.env.NODE_ENV === 'development'
//是否开启调试模式
const isDebug = true//process.argv.includes('--debug')

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

export {
  isDev,
  isDebug,
  names,
  events,
  channels,
}
