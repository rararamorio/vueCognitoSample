// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import cognito from './cognito'
import 'es6-promise/auto'
import 'fetch-polyfill'
import store from './store'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  cognito,
  store,
  components: { App },
  template: '<App/>'
})
