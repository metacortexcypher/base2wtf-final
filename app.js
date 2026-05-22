document.addEventListener('DOMContentLoaded', () => {
  // Auto-scroll loop for events gallery
  const track = document.getElementById('event-carousel-track');
  if (track) {
    const cards = Array.from(track.children);
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // If it's just '#', let it default
      if (href === '#') return;
      
      // Check if it's the contact dialog triggers
      if (href === '#associate' && this.classList.contains('btn') && !this.classList.contains('btn-secondary')) {
        // Ignore smooth scroll if clicking Join Us to open modal
        return;
      }
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- Header Scrolled State ---
  const header = document.querySelector('header');
  
  // --- Scroll Highlight Effect for Sticky About Section ---
  const aboutTextElements = document.querySelectorAll('.scroll-text-container p');
  aboutTextElements.forEach(el => {
    const words = el.innerText.split(' ');
    el.innerHTML = '';
    words.forEach(word => {
      if (word.trim() === '') return;
      const span = document.createElement('span');
      span.className = 'scroll-word';
      span.innerText = word + ' ';
      el.appendChild(span);
    });
  });
  const scrollWords = document.querySelectorAll('.scroll-word');
  const scrollSection = document.querySelector('.scroll-section');

  // Reveal elements on scroll
  const revealElements = document.querySelectorAll('.reveal');
  const handleScrollEvents = () => {
    // Header glassmorphism
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);

    // Fade in sections
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= viewHeight * 0.85) {
        el.classList.add('active');
      }
    });

    // Sticky text scrub highlight
    if (scrollSection && scrollWords.length > 0) {
      const rect = scrollSection.getBoundingClientRect();
      // Progress from 0 to 1 as the section scrolls through the viewport
      const scrollProgress = -rect.top / (rect.height - viewHeight);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      
      scrollWords.forEach((word, index) => {
        const threshold = index / scrollWords.length;
        if (clampedProgress > threshold) {
          word.style.opacity = '1';
        } else {
          word.style.opacity = '0.15';
        }
      });
    }
  };

  window.addEventListener('scroll', handleScrollEvents);
  handleScrollEvents(); // trigger initial run

  // ==========================================
  // MODERN DIALOG MODAL & FORM LOGIC
  // ==========================================
  const contactDialog = document.getElementById('contact-dialog');
  const closeDialogBtn = document.getElementById('close-dialog-btn');
  const contactForm = document.getElementById('contact-form');
  const purposeSelect = document.getElementById('contact-purpose');
  
  const formInitialState = document.getElementById('form-initial-state');
  const formSuccessState = document.getElementById('form-success-state');
  
  // Set up triggers
  const dialogTriggers = [
    { selector: 'a[href="#associate"].btn-secondary', purpose: 'join-house' }, // Header Join Us
    { selector: 'a[href="#associate"].btn:not(.btn-secondary)', purpose: 'join-house' }, // Join Us header buttons or footer
    { selector: '.association-card:nth-child(1) .assoc-action', purpose: 'attend-event' }, // Attend Event
    { selector: '.association-card:nth-child(2) .assoc-action', purpose: 'desk-access' }, // Desk Access
    { selector: '.association-card:nth-child(3) .assoc-action', purpose: 'jam-session' }, // Jam Session
    { selector: '.collab-left .btn', purpose: 'partner-ally' }, // Allies "Get in Touch"
    { selector: '.collab-card', purpose: 'partner-ally' } // Direct Sponsors & Allies Cards click
  ];

  // Dynamically hook up all triggers to open modal and set select value
  dialogTriggers.forEach(trigger => {
    const elements = document.querySelectorAll(trigger.selector);
    elements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update select option
        if (purposeSelect) {
          purposeSelect.value = trigger.purpose;
        }

        // Reset states
        if (formInitialState) formInitialState.style.display = 'block';
        if (formSuccessState) formSuccessState.style.display = 'none';
        if (contactForm) contactForm.reset();

        // Open native modal
        if (contactDialog) {
          contactDialog.showModal();
          document.body.style.overflow = 'hidden'; // Lock background scrolling
        }
      });
    });
  });

  // Close Dialog handlers
  const closeDialog = () => {
    if (contactDialog) {
      contactDialog.close();
      document.body.style.overflow = ''; // Unlock scrolling
    }
  };

  if (closeDialogBtn) {
    closeDialogBtn.addEventListener('click', closeDialog);
  }

  // Close dialog on clicking outside (backdrop click)
  if (contactDialog) {
    contactDialog.addEventListener('click', (e) => {
      const dialogDimensions = contactDialog.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        closeDialog();
      }
    });

    // Handle Escape key close to unlock scrolling
    contactDialog.addEventListener('cancel', () => {
      document.body.style.overflow = '';
    });
  }

  // Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Premium validation
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const detailInput = document.getElementById('contact-details');

      if (!nameInput.value || !emailInput.value || !detailInput.value) {
        return;
      }

      // Show beautiful loading micro-animation on submit button
      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner"></span>
        Processing Application...
      `;

      // Pre-compile direct mail draft parameters
      const name = nameInput.value;
      const email = emailInput.value;
      const purposeText = purposeSelect ? purposeSelect.options[purposeSelect.selectedIndex].text : 'Engagement';
      const userDetails = detailInput.value;
      const linkedin = document.getElementById('contact-social').value || 'Not provided';

      const emailSubject = encodeURIComponent(`base 2 Application - ${purposeText} (${name})`);
      const emailBody = encodeURIComponent(
        `Hi base 2 Team,\n\n` +
        `I have submitted an application via the website with the following details:\n\n` +
        `- Name: ${name}\n` +
        `- Email: ${email}\n` +
        `- LinkedIn/GitHub: ${linkedin}\n` +
        `- Purpose: ${purposeText}\n\n` +
        `Details / Project Proposal:\n` +
        `${userDetails}\n\n` +
        `Looking forward to connecting!\n`
      );

      // Simulate network transition (1200ms) for high-end feel
      setTimeout(() => {
        // Swap to Success screen inside modal
        if (formInitialState) formInitialState.style.display = 'none';
        if (formSuccessState) formSuccessState.style.display = 'flex';
        
        // Reset submit button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Set up the mailto action trigger on success screen
        const successMailBtn = document.getElementById('success-mail-btn');
        if (successMailBtn) {
          successMailBtn.setAttribute('href', `mailto:hi@base.wtf?subject=${emailSubject}&body=${emailBody}`);
        }
      }, 1200);
    });
  }

  // ==========================================
  // POLAROID EVENT CAROUSEL INTERACTIVE SCROLL
  // ==========================================
  const carouselTrack = document.getElementById('event-carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (carouselTrack && prevBtn && nextBtn) {
    // scroll amount matches approximate polaroid card width (320px) + gap (40px)
    const scrollAmount = 360;

    nextBtn.addEventListener('click', () => {
      carouselTrack.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });

    prevBtn.addEventListener('click', () => {
      carouselTrack.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });

    // Disable / fade buttons dynamically when reaching the scroll limits
    const toggleNavButtons = () => {
      const isAtStart = carouselTrack.scrollLeft <= 5;
      const isAtEnd = carouselTrack.scrollLeft + carouselTrack.clientWidth >= carouselTrack.scrollWidth - 5;
      
      prevBtn.style.opacity = isAtStart ? '0.3' : '1';
      prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
      
      nextBtn.style.opacity = isAtEnd ? '0.3' : '1';
      nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    };

    carouselTrack.addEventListener('scroll', toggleNavButtons);
    // Wait briefly for rendering layout to calculate scroll bounds
    setTimeout(toggleNavButtons, 200);
  }
});
