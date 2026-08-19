(function () {
  // Variables
  var nav = document.querySelector('.header__navigation');
  var langSwitcher = document.querySelector('.header__language-switcher');
  var search = document.querySelector('.header__search');
  var allToggles = document.querySelectorAll('.header--toggle');
  var navToggle = document.querySelector('.header__navigation--toggle');
  var langToggle = document.querySelector('.header__language-switcher--toggle');
  var searchToggle = document.querySelector('.header__search--toggle');
  var closeToggle = document.querySelector('.header__close--toggle');
  var allElements = document.querySelectorAll(
    '.header--element, .header--toggle'
  );
  var emailGlobalUnsub = document.querySelector('input[name="globalunsub"]');

  // Functions

  // Function for executing code on document ready
  function domReady(callback) {
    if (['interactive', 'complete'].indexOf(document.readyState) >= 0) {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  // Function for toggling mobile navigation
  function toggleNav() {
    allToggles.forEach(function (toggle) {
      toggle.classList.toggle('hide');
    });

    nav.classList.toggle('open');
    navToggle.classList.toggle('open');

    closeToggle.classList.toggle('show');
  }

  // Function for toggling mobile language selector
  function toggleLang() {
    allToggles.forEach(function (toggle) {
      toggle.classList.toggle('hide');
    });

    langSwitcher.classList.toggle('open');
    langToggle.classList.toggle('open');

    closeToggle.classList.toggle('show');
  }

  // Function for toggling mobile search field
  function toggleSearch() {
    allToggles.forEach(function (toggle) {
      toggle.classList.toggle('hide');
    });

    search.classList.toggle('open');
    searchToggle.classList.toggle('open');

    closeToggle.classList.toggle('show');
  }

  // Function for the header close option on mobile
  function closeAll() {
    allElements.forEach(function (element) {
      element.classList.remove('hide', 'open');
    });

    closeToggle.classList.remove('show');
  }

  // Function to disable the other checkbox inputs on the email subscription system page template
  function toggleDisabled() {
    var emailSubItem = document.querySelectorAll('#email-prefs-form .item');

    emailSubItem.forEach(function (item) {
      var emailSubItemInput = item.querySelector('input');

      if (emailGlobalUnsub.checked) {
        item.classList.add('disabled');
        emailSubItemInput.setAttribute('disabled', 'disabled');
        emailSubItemInput.checked = false;
      } else {
        item.classList.remove('disabled');
        emailSubItemInput.removeAttribute('disabled');
      }
    });
  }

  // Execute JavaScript on document ready
  domReady(function () {
    if (!document.body) {
      return;
    } else {
      // Function dependent on language switcher
      if (langSwitcher) {
        langToggle.addEventListener('click', toggleLang);
      }

      // Function dependent on navigation
      if (navToggle) {
        navToggle.addEventListener('click', toggleNav);
      }

      // Function dependent on search field
      if (searchToggle) {
        searchToggle.addEventListener('click', toggleSearch);
      }

      // Function dependent on close toggle
      if (closeToggle) {
        closeToggle.addEventListener('click', closeAll);
      }

      // Function dependent on email unsubscribe from all input
      if (emailGlobalUnsub) {
        emailGlobalUnsub.addEventListener('change', toggleDisabled);
      }
    }
  });
})();







////////////////////////////
// Eye brow animation
/////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  // 1. Find all eyebrow text elements on the page
  const eyebrows = document.querySelectorAll('.eyebrow-text');

  // 2. Create the Intersection Observer to watch for scroll
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      // When the eyebrow text enters the viewport
      if (entry.isIntersecting) {
        const target = entry.target;
        const textToType = target.getAttribute('data-original-text');

        // Check if it has already been animated to prevent re-typing
        if (!target.classList.contains('is-typed')) {
          target.classList.add('is-typed');
          target.textContent = ''; // Clear text just before typing starts
          
          let i = 0;
          const typingSpeed = 30; // Speed in milliseconds (lower is faster)

          // The typing function
          function typeWriter() {
            if (i < textToType.length) {
              target.textContent += textToType.charAt(i);
              i++;
              setTimeout(typeWriter, typingSpeed);
            }
          }
          
          typeWriter(); // Start typing
        }
      }
    });
  }, {
    // Triggers the animation when the element is 10% up from the bottom of the screen
    rootMargin: "0px 0px -10% 0px", 
    threshold: 0
  });

  // 3. Prepare each eyebrow element on load
  eyebrows.forEach(eyebrow => {
    // Store the original text from your HubL macro in a data attribute
    const originalText = eyebrow.textContent;
    eyebrow.setAttribute('data-original-text', originalText);
    
    // Empty the text visually so it's blank until the user scrolls to it
    eyebrow.textContent = ''; 
    
    // Tell the observer to watch this element
    observer.observe(eyebrow);
  });
});
