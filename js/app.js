// Main Application Lifecycle & Router for +Cultura

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Storage (seeds catalog and demo user if needed)
  Storage.init();

  // Initialize UI & Router
  UI.init();

  // Setup Navigation Click Handlers
  document.querySelectorAll('[data-view]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = elem.dataset.view;
      if (targetView) {
        UI.navigate(targetView);
        // Close mobile drawer if open
        closeMobileDrawer();
      }
    });
  });

  // Mobile drawer toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerBackdrop = document.getElementById('mobile-drawer-backdrop');

  if (mobileMenuToggle && mobileDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.toggle('open');
    });
  }

  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', () => {
      closeMobileDrawer();
    });
  }

  if (mobileDrawerBackdrop) {
    mobileDrawerBackdrop.addEventListener('click', () => {
      closeMobileDrawer();
    });
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove('open');
  }

  console.log('+Cultura platform initialized successfully! ✨');
});
