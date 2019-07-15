<template>
  <div class="update">
    {{user}}
    <form @submit.prevent="exec">
      <table border=1>
          <tr>
            <th>ID</th>
            <td>{{user['Username']}}</td>
          </tr>
          <tr>
            <th>ステータス</th>
            <td>{{user['UserStatus']}}</td>
          </tr>
          <tr>
            <th>メール</th>
            <td>{{user['email']}}</td>
          </tr>
          <tr>
            <th>親</th>
            <td><input type="text" v-model="boss" /></td>
          </tr>
          <tr>
            <th>子</th>
            <td><input type="text" v-model="child" /></td>
          </tr>
      </table>
      <button type="submit">更新</button>
    </form>
    <a @click="logout">ログアウト</a>
  </div>
</template>

<script>
export default {
  name: 'UpdateUser',
  props: ['userId'],
  data () {
    return {
      user: {Username: null, UserStatus: null, email: null, 'custom:boss': null, 'custom:child': null},
      userName: null,
      boss: null,
      child: null
    }
  },
  methods: {
    logout () {
      this.$router.push('/logout')
    },
    searchUser (userId) {
      let userMap = {}
      console.log('searchUser')
      console.log(userId)
      this.$cognito.getIdToken().then(session => {
        console.log(session)
        this.$cognito.userSearch(session, userId).then((user) => {
          console.log(user)
          userMap['Username'] = user['Username']
          userMap['UserStatus'] = user['UserStatus']
          console.log(user.UserAttributes)
          user.UserAttributes.forEach(function (val, key) {
            userMap[val.Name] = val.Value
          })
          this.user = userMap
          this.userName = userMap['Username']
          this.boss = userMap['custom:boss']
          this.child = userMap['custom:child']
          console.log(this.user)
        })
      })
    },
    exec: function () {
      this.$cognito.getIdToken().then(session => {
        let customParams = [{Name: 'custom:boss', Value: this.boss}, {Name: 'custom:child', Value: this.child}]
        this.$cognito.customUpdate(session, this.userName, customParams).then((data) => {
          console.log(data)
        }).catch((err) => {
          console.log(err)
        })
      })
    }
  },
  beforeMount () {
    console.log('load')
  },
  mounted () {
    console.log('userId changed ' + this.userId)
    this.searchUser(this.userId)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
