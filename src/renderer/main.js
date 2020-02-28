// import the styles
import 'bulma-pro/bulma.sass'
import { ipcRenderer } from 'electron'
import { events } from '../main/constants'
import 'material-design-icons/iconfont/material-icons.css'
import Vue from 'vue'
import App from './App.vue'
import './assets/style/animations.scss'
import './assets/style/main.scss'
import router from './router/index'
import store from './store/index'

const isDev = process.env.NODE_ENV === 'development'

if (process.env.IS_BROWSER) {
  Vue.use(require('vue-electron'))
}

Vue.config.devtools = isDev
Vue.config.performance = isDev
Vue.config.productionTip = isDev

// tslint:disable-next-line: no-unused-expression
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
})

// handle menu event updates from main script
ipcRenderer.on('change-view', (event, data) => {
  if (data.route) {
    router.push(data.route)
  }
})

ipcRenderer.on(events.LOG_MESSAGE, ((event, args) => {
  console.log('zp::: main renderer log>>>' + args)
}))
