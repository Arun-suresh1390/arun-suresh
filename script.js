/* --- Neural Network Canvas Animation --- */
const canvas = document.getElementById('neuro-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: -100, y: -100 };

// Configuration for the particle system
const config = {
    particleCount: 60, // Fewer nodes for elegance
    connectionDistance: 150,
    mouseDistance: 200,
    baseSpeed: 0.3, // Slower movement
    colors: ['#F5F5DC', '#FFFFFF'] // Cream & White
};

// Resize handler
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * config.baseSpeed;
        this.vy = (Math.random() - 0.5) * config.baseSpeed;
        this.size = Math.random() * 2 + 1;
        this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
    }

    update() {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);

        if (distance < config.mouseDistance) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (config.mouseDistance - distance) / config.mouseDistance;
            const directionX = forceDirectionX * force * 0.5; // Push strength
            const directionY = forceDirectionY * force * 0.5;

            this.vx -= directionX; // Push away from mouse
            this.vy -= directionY;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Initialize particles
function initParticles() {
    particles = [];
    // Adjust count based on screen size
    const count = window.innerWidth < 768 ? 50 : config.particleCount;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw connections
    connectParticles();

    requestAnimationFrame(animate);
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.connectionDistance) {
                let opacity = 1 - (distance / config.connectionDistance);
                // Cream color lines: rgba(245, 245, 220, ...)
                ctx.strokeStyle = `rgba(245, 245, 220, ${opacity * 0.15})`; 
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// Event Listeners for Canvas
window.addEventListener('resize', () => {
    resize();
    initParticles();
});
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = -100; // Reset off screen
    mouse.y = -100;
});

// Start Canvas
resize();
initParticles();
animate();


/* --- Custom Cursor Logic (Smooth LERP) --- */
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

let mouseX = 0;
let mouseY = 0;
let outlineX = 0;
let outlineY = 0;

// Capture mouse position exactly
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot follows instantly
    if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }
});

// Smooth animation loop for the outline
function animateCursor() {
    // LERP (Linear Interpolation) formula: current + (target - current) * fraction
    // 0.15 is the "smoothness" factor. Lower = slower/smoother lag.
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    
    if (cursorOutline) {
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
    }
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Add hover class to body when hovering interactive elements
const interactiveElements = document.querySelectorAll('a, button, input, textarea');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});


/* --- Text Glitch Effect on Hover --- */
const glitchLinks = document.querySelectorAll('.glitch-link');
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

glitchLinks.forEach(link => {
    link.addEventListener('mouseover', event => {
        let iteration = 0;
        const originalText = event.target.dataset.text;
        
        clearInterval(event.target.interval);

        event.target.interval = setInterval(() => {
            event.target.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if(iteration >= originalText.length) { 
                clearInterval(event.target.interval);
            }
            
            iteration += 1 / 3;
        }, 30);
    });
});


/* --- Scroll Reveal Animation --- */
const observerOptions = {
    threshold: 0.15, // Trigger a bit later
    rootMargin: "0px 0px -50px 0px" // Offset slightly from bottom
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    // Add class for CSS to handle transition
    section.classList.add('fade-section');
    observer.observe(section);
});