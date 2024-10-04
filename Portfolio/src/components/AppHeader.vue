<template>
  <div class="container">
    <nav class="header">
      <div class="header-content">
        <div class="left-content">
          <div class="image-container">
            <img :src="logosrc" class="profile-image">
            <h1>Yousef Mohammad</h1>
          </div>
          <p class="description">Master of Science in Engineering: Software Engineering student.</p>
        </div>
        <div class="buttons">
          <button class="btn" @click="goToCourseList">CourseList</button>
          <button class="btn" @click="goToGitHub">GitHub</button>
          <button class="btn" @click="goToCV">CV</button>
          <button class="btn" @click="goToprojects">Porojects</button>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import logo from '../assets/profileIamge.jpg';

export default {
  name: 'AppHeader',
  data() {
    return {
      logosrc: logo
    };
  },
  methods: {
    goToGitHub() {
      window.open('https://github.com/YousefMelhem', '_blank');
    },
    goToCV() {
      // Implementation for goToCV
    },
    goToCourseList() {
      // Implementation for goToCourseList
    //   this.$router.push({name: "Courses"});
    }, 
    goToProjects() {
      // Implementation for goToProjects
      }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #07012c44;
}

.header {
  width: 40%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.left-content{} 

.btn {
  color: #4dd7e9;
  background-color: #07012c44;
  border: 1px solid #4dd7e9;}
h1 {
    color: #4dd7e9;
  }
.description {
  color: #4dd7e9;
  display: flex;
  flex-direction: column;
}

.image-container {
  display: flex;
  flex-direction: column;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding-top: 10px;
}

.btn {
  margin: 5px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>