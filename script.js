// Typewriter effect for terminal window
const typeWriterElement = document.getElementById('typewriter');
const texts = [
    "> Init AI_Engineer_Protocol...",
    "> Loading GenAI production architectures...",
    "> Orchestrating Multi-Agent Systems...",
    "> Target: Enterprise Production Environment...",
    "> Status: System Online."
];

let lineIndex = 0;
let charIndex = 0;

function typeWriter() {
    if (lineIndex < texts.length) {
        if (charIndex < texts[lineIndex].length) {
            typeWriterElement.innerHTML += texts[lineIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 50);
        } else {
            typeWriterElement.innerHTML += "<br>";
            lineIndex++;
            charIndex = 0;
            setTimeout(typeWriter, 500);
        }
    } else {
        // Add cursor blink after typing finishes
        typeWriterElement.innerHTML += '<span class="cursor">_</span>';
        setInterval(() => {
            const cursor = document.querySelector('.cursor');
            if(cursor) {
                cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
            }
        }, 500);
    }
}

// Start typing effect on load
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(typeWriter, 500);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80, // adjust for fixed navbar
                behavior: 'smooth'
            });
        }
    });
});

// Scroll effects: subtle parallax for blobs and scroll spy for active navigation links
const sections = document.querySelectorAll('header, section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Very subtle movement for blobs
    const blobs = document.querySelectorAll('.blob');
    blobs.forEach((blob, index) => {
        blob.style.transform = `translateY(${scrollPos * (0.05 * (index + 1))}px)`;
    });

    // Scroll spy: identify the active section
    let currentSectionId = 'hero';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150; // offset for sticky nav bar
        const sectionHeight = section.offsetHeight;
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            currentSectionId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
});
