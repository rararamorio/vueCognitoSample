import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js'
import { config, CognitoIdentityCredentials, CognitoIdentityServiceProvider } from 'aws-sdk'

export default class Cognito {
  configure () {
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.UserPoolId,
      ClientId: process.env.ClientId
    })
  }

  static install = (Vue, options) => {
    Object.defineProperty(Vue.prototype, '$cognito', {
      get () { return this.$root._cognito }
    })

    Vue.mixin({
      beforeCreate () {
        console.log(this.$options.cognito)
        if (this.$options.cognito) {
          this._cognito = this.$options.cognito
          this._cognito.configure()
        }
      }
    })
  }

  /**
   * username, passwordでサインアップ
   * username = emailとしてUserAttributeにも登録
   */
  signUp (username, password) {
    const dataEmail = { Name: 'email', Value: username }
    const attributeList = []
    attributeList.push(new CognitoUserAttribute(dataEmail))
    return new Promise((resolve, reject) => {
      this.userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * 確認コードからユーザーを有効化する
   */
  confirmation (username, confirmationCode) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
   * username, passwordでログイン
   */
  login (username, password) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    const authenticationData = { Username: username, Password: password }
    const authenticationDetails = new AuthenticationDetails(authenticationData)
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log(result)
          resolve(result)
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * ログアウト
   */
  logout () {
    this.userPool.getCurrentUser().signOut()
  }

  /**
   * ログインしているかの判定
   */
  isAuthenticated () {
    const cognitoUser = this.userPool.getCurrentUser()
    return new Promise((resolve, reject) => {
      if (cognitoUser === null) { reject(cognitoUser) }
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err)
        } else {
          if (!session.isValid()) {
            reject(session)
          } else {
            resolve(session)
          }
        }
      })
    })
  }

  /**
   * idTokenと書いているが、sessionを取り出すのに使用（変数名直してない、、、）
   */
  async getIdToken () {
    console.log('getIdToken')
    return new Promise((resolve, reject) => {
      this.isAuthenticated().then(session => {
        resolve(session)
      }).catch(session => {
        reject(session)
      })
    })
  }

  /**
   * 特定のユーザ情報を取得する
   * @param {*} session ログインしているユーザの情報
   * @param {*} Username ユーザネーム（メアドを定義しているとメアド）
   */
  userSearch (session, Username) {
    return new Promise((resolve, reject) => {
      config.region = process.env.Region
      let cpi = `cognito-idp.${process.env.Region}.amazonaws.com/${process.env.UserPoolId}`
      config.credentials = new CognitoIdentityCredentials({
        IdentityPoolId: process.env.IdentityPoolId,
        Logins: {
          // Change the key below according to the specific region your user pool is in.
          [cpi]: session.getIdToken().getJwtToken()
        }
      })
      console.log('listAllUsers')
      console.log(config)
      var params = {
        UserPoolId: process.env.UserPoolId,
        Username: Username
      }
      let cognitoidp = new CognitoIdentityServiceProvider()
      cognitoidp.adminGetUser(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * カスタム属性（？）を更新する
   * @param {*} session ログインしているユーザの情報
   * @param {*} username 更新対象のユーザ
   * @param {*} customParams カスタム属性
   */
  customUpdate (session, username, customParams) {
    return new Promise((resolve, reject) => {
      config.region = process.env.Region
      let cpi = `cognito-idp.${process.env.Region}.amazonaws.com/${process.env.UserPoolId}`
      config.credentials = new CognitoIdentityCredentials({
        IdentityPoolId: process.env.IdentityPoolId,
        Logins: {
          // Change the key below according to the specific region your user pool is in.
          [cpi]: session.getIdToken().getJwtToken()
        }
      })
      var params = {
        UserAttributes: customParams,
        UserPoolId: process.env.UserPoolId,
        Username: username
      }
      let cognitoidp = new CognitoIdentityServiceProvider()
      cognitoidp.adminUpdateUserAttributes(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * 登録されているユーザ一覧を取得する
   * @param {*} session ログインしているユーザ情報
   */
  async listAllUsers (session) {
    config.region = process.env.Region
    let cpi = `cognito-idp.${process.env.Region}.amazonaws.com/${process.env.UserPoolId}`
    config.credentials = new CognitoIdentityCredentials({
      IdentityPoolId: process.env.IdentityPoolId,
      Logins: {
        // Change the key below according to the specific region your user pool is in.
        [cpi]: session.getIdToken().getJwtToken()
      }
    })
    console.log('listAllUsers')
    console.log(config)
    let cognitoidp = new CognitoIdentityServiceProvider()

    let token = ''
    let users = await this.listAllActiveUsers(cognitoidp, token)
    return users
  }

  /**
   * 1度に60件しか取得できないので、再帰処理で全権取得する
   */
  async listAllActiveUsers (cognitoidp, token) {
    const params = {
      UserPoolId: process.env.UserPoolId,
      Limit: 60
    }
    if (token) params.PaginationToken = token
    const data = await cognitoidp.listUsers(params).promise()
    if (!data.PaginationToken) {
      return data.Users
    }
    const nextItems = await this.listAllActiveUsers(cognitoidp, data.PaginationToken)
    const users = data.Users
    Array.prototype.push.apply(users, nextItems)
    console.log(users)
    return users
  }
}
