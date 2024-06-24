<template>
    <div>
      <Header />
      <CourseList />
    </div>
  </template>
  
  <script>
  import Header from '@/components/AppHeader.vue';
  import CourseList from '@/components/CourseList.vue';
  
  export default {
    components: {
      Header,
      CourseList
    }
  };
  </script>
  