<template>
  <div id="app">
    <Header />
    <CourseList />
    <GithubButton />
    <CVButton />
  </div>
</template>

<script>
import Header from './components/AppHeader.vue';
import CourseList from './components/CourseList.vue';


export default {
  name: 'App',
  components: {
    Header,
    CourseList
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
