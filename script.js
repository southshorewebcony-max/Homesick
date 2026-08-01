/* ==========================================================================
   HOMESICK — site interactions
   Minimal, dependency-free JS: mobile nav toggle, sticky header state,
   and a scroll-reveal effect (skipped entirely for reduced-motion users).
   ========================================================================== */

(function () {
    'use strict';

    /* ---------------------------------------------------------------------
       Mobile navigation toggle
       --------------------------------------------------------------------- */
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('primary-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close the menu after a link is chosen (mobile)
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------------------------------------------------------------------
       Sticky header — add a background/border once the page scrolls
       --------------------------------------------------------------------- */
    var header = document.getElementById('site-header');

    if (header) {
        var updateHeader = function () {
            header.classList.toggle('is-scrolled', window.scrollY > 12);
        };
        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
    }

    /* ---------------------------------------------------------------------
       Scroll reveal — fade + rise sections into view as they enter frame.
       Respects prefers-reduced-motion by skipping straight to visible.
       --------------------------------------------------------------------- */
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var revealTargets = document.querySelectorAll(
        '#release .release-content, #recording .studio-gallery, #recording .studio-video, ' +
        '#recording .studio-journal, #shows .show, #live-performances .featured-video, ' +
        '#about .about-content, #about .band-members, #gallery .gallery-grid, ' +
        '#listen .streaming-links, #contact .contact-email'
    );

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach(function (el) { el.classList.add('reveal', 'is-visible'); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add('reveal'); });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(function (el) { observer.observe(el); });
    }

    /* ---------------------------------------------------------------------
       Gallery lightbox — fullscreen, uncropped photo preview.
       Triggered on click/tap rather than hover: hover has no equivalent
       on touch devices, so click/tap is what makes this work identically
       on desktop and mobile, per the "works on both" requirement.
       --------------------------------------------------------------------- */
    var lightbox = document.getElementById('lightbox');
    var lightboxImage = document.getElementById('lightboxImage');
    var lightboxClose = document.getElementById('lightboxClose');
    var galleryImages = document.querySelectorAll('.gallery-grid img');
    var lastFocused = null;

    function openLightbox(img) {
        if (!lightbox || !lightboxImage) return;

        lastFocused = document.activeElement;

        lightboxImage.src = img.currentSrc || img.src;
        lightboxImage.alt = img.alt || '';

        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');

        if (lightboxClose) lightboxClose.focus();

        document.addEventListener('keydown', onLightboxKeydown);
    }

    function closeLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('lightbox-open');

        document.removeEventListener('keydown', onLightboxKeydown);

        // Clear the src after the fade-out finishes so nothing lingers loaded
        window.setTimeout(function () {
            if (lightbox && !lightbox.classList.contains('is-open') && lightboxImage) {
                lightboxImage.src = '';
            }
        }, 300);

        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    function onLightboxKeydown(event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            closeLightbox();
        }
    }

    galleryImages.forEach(function (img) {
        // Make thumbnails keyboard-operable too
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        if (!img.hasAttribute('aria-label')) {
            img.setAttribute('aria-label', 'View full photo: ' + (img.alt || 'gallery image'));
        }

        img.addEventListener('click', function () { openLightbox(img); });
        img.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(img);
            }
        });
    });

    if (lightbox) {
        lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
            el.addEventListener('click', closeLightbox);
        });
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
})();