<template>
  <v-container fluid fill-height>
    <v-layout justify-center align-center>
      <h2>{{ msg }}</h2>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to JG. API TESTER'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
