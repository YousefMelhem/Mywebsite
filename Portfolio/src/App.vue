<template>
  <div id="app">
    <Header />
    <GithubButton />
    <CVButton />
  </div>
  <div id = "course-list">
    <CourseList />
  </div>
</template>

<script>
import Header from './components/AppHeader.vue';

export default {
  name: 'App',
  components: {
    Header
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c5047fb;
  margin-top: 60px;
}
</style>
