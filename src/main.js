// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'

import('@/assets/css/vuetifyFont.css')
import('vuetify/dist/vuetify.min.css')

window._ = require('lodash')

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(Vuetify)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
