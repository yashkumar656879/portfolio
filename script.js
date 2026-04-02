// Auth state checker
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/me');
        if (res.ok) {
            const data = await res.json();
            const authLinks = document.querySelectorAll('.auth-nav-link');
            authLinks.forEach(link => {
                if (data.authenticated) {
                    link.href = 'profile.html';
                    if (data.user && data.user.avatar) {
                        link.innerHTML = `<img src="${data.user.avatar}" style="width:20px; height:20px; border-radius:50%; vertical-align:middle; margin-right:8px;">Profile`;
                    } else {
                        link.textContent = 'My Profile';
                    }
                } else {
                    link.textContent = 'Sign In';
                    link.href = 'login.html';
                }
            });
        }
    } catch (err) {
        console.error('Auth check failed:', err);
    }
});

// Typed effect for hero title
const typedElement = document.getElementById('typed');
const professions = ['Web Developer.', 'App Developer.', 'AI Enthusiast.', 'Automation Specialist.'];
let professionIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
    if (!typedElement) return;
    const currentProfession = professions[professionIndex];
    
    if (isDeleting) {
        typedElement.textContent = currentProfession.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        typedElement.textContent = currentProfession.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 150;
    }

    if (!isDeleting && charIndex === currentProfession.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        professionIndex = (professionIndex + 1) % professions.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

// Reveal elements on scroll
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const revealTop = element.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            element.classList.add('active');
        }
    });
}

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    reveal();
});

// Initial call
window.onload = () => {
    if (typedElement) {
        type();
    }
    reveal(); // Initial reveal for hero items
};

// Contact form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = contactForm.querySelector('button[type="submit"]');
        const msgEl = document.getElementById('contactFormMessage');
        const originalBtnText = btn.innerHTML;
        
        btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin" style="margin-left: 0.5rem;"></i>';
        btn.disabled = true;
        msgEl.textContent = '';

        const payload = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            service: document.getElementById('contactService').value,
            budget: document.getElementById('contactBudget').value,
            message: document.getElementById('contactMessage').value
        };

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                // Prepare mailto link
                const subject = encodeURIComponent(`Project Inquiry: ${payload.service || 'Freelance Work'}`);
                const bodyText = `Hi Yash,\n\n${payload.message}\n\n---\nProject Budget: ${payload.budget || 'Not specified'}\n\nFrom: ${payload.name}\nEmail: ${payload.email}`;
                const mailToUrl = `mailto:yashkumar656879@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
                
                // Open default email client
                window.location.href = mailToUrl;

                msgEl.textContent = 'Opening your email client...';
                msgEl.style.color = '#00f2fe';
                contactForm.reset();
            } else {
                msgEl.textContent = data.error || 'Failed to send message. Please try again.';
                msgEl.style.color = '#ff4d4d';
            }
        } catch (err) {
            msgEl.textContent = 'Network error. Please try again later.';
            msgEl.style.color = '#ff4d4d';
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    });
}
