<template>
  <HomePage msg="Welcome to Your Vue.js App" />
</template>

<script>
import HomePage from "./components/HomePage.vue";

export default {
  name: "App",
  components: {
    HomePage: HomePage,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  /*margin-top: 60px;*/
}
body {
  background-color: #080808;
}
</style>

/*
https://www.youtube.com/watch?v=13fv-xEAFmY&list=PLDoPjvoNmBAxr5AqK3Yz4DWYKVSmIFziw  
this is a youtube chanle 
*/