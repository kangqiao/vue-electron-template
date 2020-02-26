/* Created by zhaopan on 2020/2/26. */

const isDev = process.env.NODE_ENV === 'development'
const isDebug = process.argv.includes('--debug')
const MAIN = 'main'

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

export {
  MAIN,
  isDev,
  isDebug,
  installDevTools,
}
