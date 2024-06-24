<template>
  <div class="course-container">
    <div v-for="(yearCourses, year) in coursesByYear" :key="year" class="year-column">
      <h3>{{ year }}</h3>
      <ul>
        <li v-for="course in yearCourses" :key="course">{{ course }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const coursesByYear = ref({
      '2021-2022': [
        'Linear Algebra',
        'Introduction to Programming',
        'Discrete Mathematics',
        'Introductory Project',
        'Calculus 1, 2',
        'Databases and Data Modeling',
        'Physics',
        'Applied Probability and Statistics'
      ],
      '2022-2023': [
        'Object-Oriented Programming(JAVA)',
        'Technical Communication',
        'Sustainable Development',
        'Numerical Methods',
        'Electromagnetism',
        'Algorithms and Data Structures',
        'Parallel Programming',
        'Computer Organization',
        'Software Project'
      ],
      '2023-2024': [
        'Multivariable Calculus',
        'Control Theory',
        'Industrial Economics',
        'Software Architectures',
        'Computer Graphics',
        'Scientific Methods',
        'Embedded Systems',
        'Computer Networks',
        'Computer Security',
        "Bachelor's Thesis"


      ],
      '2024-2025': [
        'Systems Modeling and Simulation',
        'Machine Learning',
        'Formal Methods',
        'Deep Learning',
        'Code Transformations and Interpretations',
        'Optimization',
        'Parallel and Distributed Computing',
        'Lean Startup',
        'Project in Model-Driven Development',
        'Project in Data-Intensive Systems'


      ],
      '2025-2026': [
        'Information Visualization',
        'Data Mining',
        'Scientific Methods in Computer Science',
        'Advanced Information Visualization and Applications',
        'Project in Data-Intensive Systems',
        'Master Thesis'
      ]
    });

    return { coursesByYear };
  }
};
</script>

<style scoped>
.course-container {
  display: flex;
  justify-content: space-around; /* Adjusts the spacing between columns */
  color: #fff; /* Adjusts the color of the text */
  background-color: #07012c44; /* Adjusts the background color of the container */
}

.year-column {
  flex: 1; /* Each column takes equal width */
  padding: 0 20px; /* Adds some padding around each column */
}

.year-column h3 {
  text-align: left; /* Aligns the year title to the left */
  margin-bottom: 2; /* Removes bottom margin to align title with courses */
  font-size: 100%;
}

.year-column ul {
  list-style-type: none; /* Removes bullet points */
  padding-left: 0; /* Aligns the list with the year title */
  font-size: 80%;
}

.year-column li::before {
  content: '• '; /* Adds a dot before each list item */
  color: rgb(255, 255, 255); /* Adjust the color as needed */
  position: relative;
  left: -1px; /* Adjusts position to align with the year title */
}
</style>