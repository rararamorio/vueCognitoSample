<template>
  <div class="hello">
    <p>{{ msg }}</p>
    <p>{{test}}</p>
    <table border=1>
        <tr>
          <th>ID</th>
          <th>ステータス</th>
          <th>メールアドレス</th>
        </tr>
        <tr v-for="user in userList" :key="user.id">
          <td>{{user['id']}}</td>
          <td>{{user['status']}}</td>
          <td><a @click="update(user['id'])">{{user['email']}}</a></td>
        </tr>
    </table>
    <a @click="logout">ログアウト</a>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      userList: [],
      msg: undefined,
      test: this.$store.state.hoge
    }
  },
  methods: {
    load () {
      // localStorage.getItem();
      console.log(this.$cognito.getIdToken())
      this.$cognito.getIdToken().then(idToken => {
        this.msg = idToken
      })
    },
    update (id) {
      this.$router.push('/update-user/' + id)
    },
    logout () {
      this.$router.push('/logout')
    }
  },
  beforeMount () {
    console.log('load')
    this.load()
  },
  mounted () {
    this.$cognito.getIdToken().then(session => {
      this.$cognito.listAllUsers(session).then((users) => {
        let userList = []
        users.forEach(function (val, index) {
          console.log(val)
          let user = {}
          user['id'] = val.Username
          user['status'] = val.UserStatus
          val.Attributes.forEach(function (v, i) {
            user[v.Name] = v.Value
          })
          userList.push(user)
        })
        this.userList = userList
      })
    })
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
