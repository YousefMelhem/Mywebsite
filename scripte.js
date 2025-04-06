// Simple function to change pages
function changePage(pageId) {
  console.log("Changing to page:", pageId);

  // Get all pages
  const pages = document.querySelectorAll(".page");

  // Hide all pages
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  // Show the target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active");
  }

  // Update the home button visibility
  updateHomeButtonVisibility(pageId);

  // Update URL hash
  window.location.hash = pageId;
}

// Function to update home button visibility
function updateHomeButtonVisibility(pageId) {
  const homeButton = document.getElementById("home-button");

  if (pageId === "home") {
    homeButton.style.display = "none";
  } else {
    homeButton.style.display = "block";
  }
}

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing...");

  // Check for a hash in the URL
  if (window.location.hash) {
    // Remove the # symbol
    const pageId = window.location.hash.substring(1);
    console.log("Hash found in URL:", pageId);
    changePage(pageId);
  } else {
    // Default to home page
    console.log("No hash found, defaulting to home");
    changePage("home");
  }

  // Add keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Home" || e.key === "h") {
      changePage("home");
    }
  });
});
