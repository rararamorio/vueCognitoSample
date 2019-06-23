import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import cognito from '@/cognito'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import Confirm from '@/components/Confirm'

Vue.use(Router)

const requireAuth = (to, from, next) => {
  cognito.isAuthenticated()
    .then(session => {
      next()
    })
    .catch(session => {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    })
}

const logout = (to, from, next) => {
  cognito.logout()
  next('/login')
}

export default new Router({
  mode: 'history',
  routes: [
    { path: '/',
      redirect: 'home'
    },
    {
      path: '/home',
      name: 'HelloWorld',
      component: HelloWorld,
      beforeEnter: requireAuth
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/singup',
      name: 'Signup',
      component: Signup
    },
    {
      path: '/confirm',
      name: 'Confirm',
      component: Confirm
    },
    { path: '/logout',
      beforeEnter: logout
    }
  ]
})
