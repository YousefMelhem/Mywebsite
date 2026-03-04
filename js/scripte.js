// ============================================================
// Configuration
// ============================================================
const CONFIG = {
  particles: {
    count: 150,
    fieldSize: 50,
    connectionDistance: 12,
    pointSize: 1.8,
    speed: 0.012,
  },
  camera: {
    fov: 60,
    distance: 35,
    parallaxFactor: 3,
    lerpSpeed: 0.05,
  },
  ambient: {
    count: 60,
    size: 0.5,
    speed: 0.005,
  },
  colors: {
    primary: 0x6366f1,
    secondary: 0x8b5cf6,
  },
};

// Scale down for mobile
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
if (isMobile) {
  CONFIG.particles.count = 50;
  CONFIG.ambient.count = 20;
  CONFIG.camera.parallaxFactor = 1.5;
  CONFIG.particles.connectionDistance = 14;
}

// ============================================================
// Three.js Neural Network
// ============================================================
let scene, camera, renderer;
let nodePositions, nodeVelocities, nodePoints;
let connectionGeometry, connectionLines;
let ambientPoints, ambientPositions, ambientVelocities;
let mouse = { x: 0, y: 0 };
let targetCamera = { x: 0, y: 0 };
let clock = 0;
let frameCount = 0;
let glowTexture;

// Generate a circular glow texture on a canvas (no external image needed)
function createGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function initScene() {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.z = CONFIG.camera.distance;

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Create shared glow texture for particles
  glowTexture = createGlowTexture();

  createNodes();
  createAmbientParticles();
  createConnections();

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('resize', onResize);

  animate();
}

// ---- Neural Network Nodes ----
function createNodes() {
  const count = CONFIG.particles.count;
  const field = CONFIG.particles.fieldSize;
  const geometry = new THREE.BufferGeometry();

  nodePositions = new Float32Array(count * 3);
  nodeVelocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    nodePositions[i3]     = (Math.random() - 0.5) * field;
    nodePositions[i3 + 1] = (Math.random() - 0.5) * field;
    nodePositions[i3 + 2] = (Math.random() - 0.5) * field * 0.5;

    nodeVelocities[i3]     = (Math.random() - 0.5) * CONFIG.particles.speed;
    nodeVelocities[i3 + 1] = (Math.random() - 0.5) * CONFIG.particles.speed;
    nodeVelocities[i3 + 2] = (Math.random() - 0.5) * CONFIG.particles.speed * 0.3;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

  const material = new THREE.PointsMaterial({
    color: CONFIG.colors.primary,
    size: CONFIG.particles.pointSize,
    map: glowTexture,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  });

  nodePoints = new THREE.Points(geometry, material);
  scene.add(nodePoints);
}

// ---- Ambient Particles ----
function createAmbientParticles() {
  const count = CONFIG.ambient.count;
  const geometry = new THREE.BufferGeometry();

  ambientPositions = new Float32Array(count * 3);
  ambientVelocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    ambientPositions[i3]     = (Math.random() - 0.5) * 80;
    ambientPositions[i3 + 1] = (Math.random() - 0.5) * 80;
    ambientPositions[i3 + 2] = (Math.random() - 0.5) * 40;

    ambientVelocities[i3]     = (Math.random() - 0.5) * CONFIG.ambient.speed;
    ambientVelocities[i3 + 1] = (Math.random() - 0.5) * CONFIG.ambient.speed;
    ambientVelocities[i3 + 2] = (Math.random() - 0.5) * CONFIG.ambient.speed;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));

  const material = new THREE.PointsMaterial({
    color: CONFIG.colors.secondary,
    size: CONFIG.ambient.size,
    map: glowTexture,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  });

  ambientPoints = new THREE.Points(geometry, material);
  scene.add(ambientPoints);
}

// ---- Connections Between Nodes ----
function createConnections() {
  const maxSegments = CONFIG.particles.count * 5;
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(maxSegments * 6);
  const colors = new Float32Array(maxSegments * 6);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setDrawRange(0, 0);

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  connectionGeometry = geometry;
  connectionLines = new THREE.LineSegments(geometry, material);
  scene.add(connectionLines);
}

// ---- Update Functions ----
function updateNodes() {
  const count = CONFIG.particles.count;
  const half = CONFIG.particles.fieldSize / 2;
  const halfZ = half * 0.5;

  for (let i = 0; i < count * 3; i += 3) {
    nodePositions[i]     += nodeVelocities[i];
    nodePositions[i + 1] += nodeVelocities[i + 1];
    nodePositions[i + 2] += nodeVelocities[i + 2];

    // Soft boundary: reverse velocity near edges
    if (Math.abs(nodePositions[i])     > half)  nodeVelocities[i]     *= -1;
    if (Math.abs(nodePositions[i + 1]) > half)  nodeVelocities[i + 1] *= -1;
    if (Math.abs(nodePositions[i + 2]) > halfZ) nodeVelocities[i + 2] *= -1;
  }

  nodePoints.geometry.attributes.position.needsUpdate = true;
}

function updateAmbient() {
  const count = CONFIG.ambient.count;
  for (let i = 0; i < count * 3; i++) {
    ambientPositions[i] += ambientVelocities[i];
    if (Math.abs(ambientPositions[i]) > 40) ambientVelocities[i] *= -1;
  }
  ambientPoints.geometry.attributes.position.needsUpdate = true;
}

function updateConnections() {
  const count = CONFIG.particles.count;
  const maxDist = CONFIG.particles.connectionDistance;
  const maxDistSq = maxDist * maxDist;
  const posArr = connectionGeometry.attributes.position.array;
  const colArr = connectionGeometry.attributes.color.array;
  const maxSegs = CONFIG.particles.count * 5;
  let seg = 0;

  // Primary color RGB: #6366f1
  const r = 0.388, g = 0.4, b = 0.945;

  for (let i = 0; i < count && seg < maxSegs; i++) {
    const ix = i * 3, iy = ix + 1, iz = ix + 2;

    for (let j = i + 1; j < count && seg < maxSegs; j++) {
      const jx = j * 3, jy = jx + 1, jz = jx + 2;

      const dx = nodePositions[ix] - nodePositions[jx];
      const dy = nodePositions[iy] - nodePositions[jy];
      const dz = nodePositions[iz] - nodePositions[jz];
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < maxDistSq) {
        const alpha = 1 - Math.sqrt(distSq) / maxDist;
        const vi = seg * 6;

        // Vertex 1
        posArr[vi]     = nodePositions[ix];
        posArr[vi + 1] = nodePositions[iy];
        posArr[vi + 2] = nodePositions[iz];

        // Vertex 2
        posArr[vi + 3] = nodePositions[jx];
        posArr[vi + 4] = nodePositions[jy];
        posArr[vi + 5] = nodePositions[jz];

        // Color with distance-based fade
        const c = alpha * 0.6;
        colArr[vi]     = r * c;
        colArr[vi + 1] = g * c;
        colArr[vi + 2] = b * c;
        colArr[vi + 3] = r * c;
        colArr[vi + 4] = g * c;
        colArr[vi + 5] = b * c;

        seg++;
      }
    }
  }

  connectionGeometry.setDrawRange(0, seg * 2);
  connectionGeometry.attributes.position.needsUpdate = true;
  connectionGeometry.attributes.color.needsUpdate = true;
}

// ---- Event Handlers ----
function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---- Animation Loop ----
function animate() {
  requestAnimationFrame(animate);
  clock += 0.008;
  frameCount++;

  // Camera parallax - smooth follow mouse
  targetCamera.x = mouse.x * CONFIG.camera.parallaxFactor;
  targetCamera.y = mouse.y * CONFIG.camera.parallaxFactor;
  camera.position.x += (targetCamera.x - camera.position.x) * CONFIG.camera.lerpSpeed;
  camera.position.y += (targetCamera.y - camera.position.y) * CONFIG.camera.lerpSpeed;
  camera.lookAt(scene.position);

  // Gentle rotation of the node field
  if (nodePoints) {
    nodePoints.rotation.y = clock * 0.05;
    nodePoints.rotation.x = Math.sin(clock * 0.3) * 0.03;
  }

  // Update particles
  updateNodes();
  updateAmbient();

  // Update connections every 2nd frame for performance
  if (frameCount % 2 === 0) {
    updateConnections();
  }

  // Subtle breathing pulse on node size
  if (nodePoints) {
    nodePoints.material.size = CONFIG.particles.pointSize + Math.sin(clock * 1.5) * 0.2;
  }

  renderer.render(scene, camera);
}

// ---- Pulse Effect on Page Change ----
function pulseNetwork() {
  if (!connectionLines || !nodePoints) return;

  // Flash bright
  connectionLines.material.opacity = 1;
  nodePoints.material.opacity = 1;
  nodePoints.material.size = CONFIG.particles.pointSize + 1;

  // Ease back to normal
  let t = 0;
  function ease() {
    t += 0.025;
    if (t >= 1) {
      connectionLines.material.opacity = 0.5;
      nodePoints.material.opacity = 0.8;
      return;
    }
    const eased = 1 - t * t; // ease-out quad
    connectionLines.material.opacity = 0.5 + 0.5 * eased;
    nodePoints.material.opacity = 0.8 + 0.2 * eased;
    nodePoints.material.size = CONFIG.particles.pointSize + 1 * eased;
    requestAnimationFrame(ease);
  }
  ease();
}

// ============================================================
// Page Navigation
// ============================================================
function changePage(pageId) {
  const pages = document.querySelectorAll('.page');
  const current = document.querySelector('.page.active');

  // Don't re-navigate to same page
  if (current && current.id === pageId) return;

  // Switch pages
  pages.forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.trim().toLowerCase() === pageId) {
      btn.classList.add('active');
    }
  });

  // Show/hide home button
  const homeBtn = document.getElementById('home-button');
  if (pageId === 'home') {
    homeBtn.classList.remove('show');
  } else {
    homeBtn.classList.add('show');
  }

  // Pulse the neural network
  pulseNetwork();
}

// ============================================================
// 3D Card Tilt Effect
// ============================================================
function initCardTilt() {
  if (isMobile) return; // Skip on mobile - no hover

  const cards = document.querySelectorAll('.project-card, .skill-category, .contact-item');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ============================================================
// Contact Form
// ============================================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const subject = data.get('subject');
    const message = data.get('message');

    const mailto = `mailto:youmoh0517@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;

    window.location.href = mailto;
    alert('Opening your email client...');
    form.reset();
  });
}

// ============================================================
// Lazy Loading
// ============================================================
function initLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => { img.src = img.src; });
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
}

// ============================================================
// Initialize Everything
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initScene();
  initCardTilt();
  initContactForm();
  initLazyLoading();

  // Set initial nav active state
  const firstNavBtn = document.querySelector('.nav-btn');
  if (firstNavBtn) firstNavBtn.classList.add('active');

  // Home button initial state
  const homeBtnContainer = document.getElementById('home-button');
  const activePage = document.querySelector('.page.active');
  if (activePage && activePage.id !== 'home') {
    homeBtnContainer.classList.add('show');
  }
});
