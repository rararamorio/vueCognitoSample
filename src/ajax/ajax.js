import axios from 'axios'
const API_URI = process.env.APIUrl

export default class Ajax {
  static install = (Vue, options) => {
    console.log('init')
    Object.defineProperty(Vue.prototype, '$ajax', {
      get () { return this.$root._ajax }
    })
    Vue.mixin({
      beforeCreate () {
        console.log(this.$options.ajax)
        if (this.$options.ajax) {
          this._ajax = this.$options.ajax
        }
      }
    })
  }

  getAjax () {
    return new Promise((resolve, reject) => {
      axios.get(API_URI + '/api/l/24001.json').then(res => {
        console.log(res)
        resolve(res)
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })
  }
}
