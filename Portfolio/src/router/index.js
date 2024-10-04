import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CourseList from '@/components/CourseList.vue'; // Step 1: Import the CourseList component

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },
  {
    path: '/courses', // The URL path for CourseList
    name: 'CourseList',
    component: CourseList // Step 2: Add the CourseList route
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;