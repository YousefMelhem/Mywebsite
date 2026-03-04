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

// Generate a circular glow texture (no external image needed)
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
    0.1, 200
  );
  camera.position.z = CONFIG.camera.distance;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  glowTexture = createGlowTexture();

  createNodes();
  createAmbientParticles();
  createConnections();

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('resize', onResize);

  animate();
}

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

  nodePoints = new THREE.Points(geometry, new THREE.PointsMaterial({
    color: CONFIG.colors.primary,
    size: CONFIG.particles.pointSize,
    map: glowTexture,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  }));
  scene.add(nodePoints);
}

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

  ambientPoints = new THREE.Points(geometry, new THREE.PointsMaterial({
    color: CONFIG.colors.secondary,
    size: CONFIG.ambient.size,
    map: glowTexture,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false,
  }));
  scene.add(ambientPoints);
}

function createConnections() {
  const maxSegments = CONFIG.particles.count * 5;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(maxSegments * 6);
  const colors = new Float32Array(maxSegments * 6);

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setDrawRange(0, 0);

  connectionGeometry = geometry;
  connectionLines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  scene.add(connectionLines);
}

function updateNodes() {
  const count = CONFIG.particles.count;
  const half = CONFIG.particles.fieldSize / 2;
  const halfZ = half * 0.5;

  for (let i = 0; i < count * 3; i += 3) {
    nodePositions[i]     += nodeVelocities[i];
    nodePositions[i + 1] += nodeVelocities[i + 1];
    nodePositions[i + 2] += nodeVelocities[i + 2];
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
        posArr[vi]     = nodePositions[ix];
        posArr[vi + 1] = nodePositions[iy];
        posArr[vi + 2] = nodePositions[iz];
        posArr[vi + 3] = nodePositions[jx];
        posArr[vi + 4] = nodePositions[jy];
        posArr[vi + 5] = nodePositions[jz];
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

function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  clock += 0.008;
  frameCount++;

  // Camera parallax
  targetCamera.x = mouse.x * CONFIG.camera.parallaxFactor;
  targetCamera.y = mouse.y * CONFIG.camera.parallaxFactor;
  camera.position.x += (targetCamera.x - camera.position.x) * CONFIG.camera.lerpSpeed;
  camera.position.y += (targetCamera.y - camera.position.y) * CONFIG.camera.lerpSpeed;
  camera.lookAt(scene.position);

  if (nodePoints) {
    nodePoints.rotation.y = clock * 0.05;
    nodePoints.rotation.x = Math.sin(clock * 0.3) * 0.03;
  }

  updateNodes();
  updateAmbient();

  if (frameCount % 2 === 0) {
    updateConnections();
  }

  if (nodePoints) {
    nodePoints.material.size = CONFIG.particles.pointSize + Math.sin(clock * 1.5) * 0.2;
  }

  renderer.render(scene, camera);
}

// ============================================================
// Dot Navigation - Scroll Tracking
// ============================================================
const sections = ['home', 'about', 'projects', 'courses', 'contact'];
const dotLinks = document.querySelectorAll('.dot-link');

function updateActiveDot() {
  const scrollY = window.scrollY;
  const windowH = window.innerHeight;
  let current = 'home';

  for (const id of sections) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.offsetTop;
    // Section is "active" when its top is within the upper half of viewport
    if (scrollY >= top - windowH * 0.4) {
      current = id;
    }
  }

  dotLinks.forEach(dot => {
    dot.classList.toggle('active', dot.dataset.section === current);
  });
}

// Smooth scroll for dot clicks
dotLinks.forEach(dot => {
  dot.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(dot.dataset.section);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

window.addEventListener('scroll', updateActiveDot, { passive: true });

// ============================================================
// Scroll Reveal Animations
// ============================================================
function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.section-title, .about-text, .skills-section, .project-card, ' +
    '.skill-category, .course-table, .contact-intro, .contact-info, ' +
    '.contact-form, .contact-item, #courses h3'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve - allows re-triggering if wanted
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px',
  });

  revealElements.forEach((el, index) => {
    el.classList.add('reveal');
    // Small stagger based on position within its section
    const parent = el.closest('.section');
    if (parent) {
      const siblings = Array.from(parent.querySelectorAll('.reveal'));
      const i = siblings.indexOf(el);
      el.style.transitionDelay = `${i * 0.08}s`;
    }
    observer.observe(el);
  });
}

// ============================================================
// 3D Card Tilt Effect
// ============================================================
function initCardTilt() {
  if (isMobile) return;

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
// Initialize
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initScene();
  initScrollReveal();
  initCardTilt();
  initContactForm();
  initLazyLoading();
  updateActiveDot();
});
