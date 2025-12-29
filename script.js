
// DOM Elements
const countdownSection = document.getElementById('countdown-section');
const greetingSection = document.getElementById('greeting-section');
const wishContainer = document.getElementById('wish-container');
const wishBox = document.getElementById('wish-box');
const showWishBtn = document.getElementById('show-wish-btn');
const sendWishBtn = document.getElementById('send-wish-btn');
const wishText = document.getElementById('wish-text');

// State
let countdownInterval;

// --- 1. Starfield Background ---
const starCanvas = document.getElementById('starCanvas');
const sCtx = starCanvas.getContext('2d');
let stars = [];

function initStars() {
    resizeCanvas(starCanvas);
    stars = [];
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * starCanvas.width,
            y: Math.random() * starCanvas.height,
            radius: Math.random() * 1.5,
            alpha: Math.random(),
            speed: Math.random() * 0.05
        });
    }
}

function animateStars() {
    sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    sCtx.fillStyle = 'white';

    stars.forEach(star => {
        sCtx.globalAlpha = star.alpha;
        sCtx.beginPath();
        sCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        sCtx.fill();

        // Twinkle
        star.alpha += star.speed * (Math.random() > 0.5 ? 1 : -1);
        if (star.alpha < 0) star.alpha = 0;
        if (star.alpha > 1) star.alpha = 1;
    });

    requestAnimationFrame(animateStars);
}

// --- 2. Countdown Logic ---
function startCountdown() {
    const targetDate = new Date();
    // Set to next Dec 31 23:59:59
    // Logic: If current date > this year's Dec 31, target next year.
    // For demo/testing: If very close, just do it.
    // Real goal: Dec 31 23:59:59 of CURRENT YEAR (or next if passed).

    // For "New Year" usually means counting to Jan 1 00:00:00
    // Target specifically 2026 as per user request text
    const newYearDate = new Date('January 1, 2026 00:00:00');

    // Force test mode if user wants (uncomment to test fireworks immediately)
    // const newYearDate = new Date(Date.now() + 5000); 

    function updateTimer() {
        const now = new Date();
        const diff = newYearDate - now;

        if (diff <= 0) {
            clearInterval(countdownInterval);
            triggerNewYear();
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        updateDigit('days', d);
        updateDigit('hours', h);
        updateDigit('minutes', m);
        updateDigit('seconds', s);
    }

    countdownInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function updateDigit(id, value) {
    const el = document.getElementById(id);
    const strVal = value < 10 ? '0' + value : value;
    if (el.innerText !== strVal.toString()) {
        // Simple GSAP punch
        gsap.fromTo(el, { scale: 1.2, color: '#fff' }, { scale: 1, color: '#ffd700', duration: 0.5 });
        el.innerText = strVal;
    }
}

// --- 3. Fireworks System ---
const fwCanvas = document.getElementById('fireworksCanvas');
const fCtx = fwCanvas.getContext('2d');
let fireworks = [];
let particles = [];
let isFireworksActive = false;

function resizeCanvas(c) {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
}

function createFirework() {
    const x = Math.random() * fwCanvas.width;
    const y = fwCanvas.height;
    const targetY = Math.random() * (fwCanvas.height / 2);
    const speed = 10 + Math.random() * 5;
    const hue = Math.floor(Math.random() * 360);

    fireworks.push({ x, y, targetY, speed, hue, active: true });
}

function createParticles(x, y, hue) {
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            hue,
            decay: 0.01 + Math.random() * 0.02
        });
    }
}

function animateFireworks() {
    if (!isFireworksActive) return;

    // Trail effect
    fCtx.globalCompositeOperation = 'destination-out';
    fCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    fCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    fCtx.globalCompositeOperation = 'lighter';

    // Update fireworks (rising rockets)
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let fw = fireworks[i];
        fw.y -= fw.speed;

        fCtx.beginPath();
        fCtx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
        fCtx.fillStyle = `hsl(${fw.hue}, 100%, 50%)`;
        fCtx.fill();

        if (fw.y <= fw.targetY) {
            createParticles(fw.x, fw.y, fw.hue);
            fireworks.splice(i, 1);
        }
    }

    // Update particles (explosions)
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        fCtx.beginPath();
        fCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        fCtx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.alpha})`;
        fCtx.fill();
    }

    if (Math.random() < 0.05) createFirework(); // Spawn chance

    requestAnimationFrame(animateFireworks);
}


function triggerNewYear() {
    // 1. Hide Countdown
    gsap.to(countdownSection, { opacity: 0, duration: 1, display: 'none' });

    // 2. Start Fireworks
    isFireworksActive = true;
    animateFireworks();

    // 3. Show Greeting
    setTimeout(() => {
        greetingSection.classList.remove('hidden');
        gsap.fromTo(greetingSection, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 2, ease: "power2.out" });
    }, 1000);
}


// --- 4. Wish Feature ---
showWishBtn.addEventListener('click', () => {
    gsap.to(greetingSection, {
        opacity: 0, y: -50, display: 'none', duration: 1, onComplete: () => {
            wishContainer.classList.remove('hidden');
            gsap.fromTo(wishContainer, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1 });
        }
    });
});

sendWishBtn.addEventListener('click', () => {
    if (wishText.value.trim() === "") return;

    // Animation Sequence
    const tl = gsap.timeline();

    // 1. Fold logic (visual only - scale down wish box and show envelope)
    tl.to(wishBox, { scale: 0, opacity: 0, duration: 0.5 });

    // 2. Fly away
    // In a real generic version we'd morph, but here let's just create a temporary flying element or assume the wishbox becomes a point of light.
    // Let's create a "flying particle" representing the wish.

    // Simulating flight
    const wishStar = document.createElement('div');
    wishStar.innerText = "✉️"; // Simple envelope icon
    wishStar.style.position = 'absolute';
    wishStar.style.left = '50%';
    wishStar.style.top = '50%';
    wishStar.style.fontSize = '2rem';
    wishStar.style.color = 'gold';
    wishStar.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(wishStar);

    tl.to(wishStar, {
        y: -window.innerHeight,
        x: (Math.random() - 0.5) * 200, // Drift
        rotation: 360,
        opacity: 0,
        duration: 3,
        ease: "power1.in"
    });

    tl.call(() => {
        wishStar.remove();
        document.getElementById('confirmation-msg').classList.remove('hidden');
        gsap.fromTo('#confirmation-msg', { opacity: 0 }, { opacity: 1, duration: 1 });
    });
});


// Initialization
window.addEventListener('resize', () => {
    resizeCanvas(starCanvas);
    resizeCanvas(fwCanvas);
    initStars();
});

initStars();
animateStars();
startCountdown();
resizeCanvas(fwCanvas);
