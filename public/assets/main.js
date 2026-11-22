(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  // Header border on scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () { header && header.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var btn = document.getElementById('menuBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        document.body.classList.remove('menu-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Netlify Forms (AJAX with graceful fallback)
  document.querySelectorAll('form[data-ajax]').forEach(function (form) {
    var wrap = form.closest('.form');
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');

    var validate = function (field) {
      var ok = field.checkValidity();
      var box = field.closest('.field');
      if (box) box.classList.toggle('invalid', !ok);
      return ok;
    };
    form.querySelectorAll('input,select,textarea').forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) validate(f); });
      f.addEventListener('input', function () {
        var box = f.closest('.field');
        if (box && box.classList.contains('invalid')) validate(f);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('[required]');
      var first = null;
      fields.forEach(function (f) { if (!validate(f) && !first) first = f; });
      if (first) {
        status.className = 'form-status error';
        status.textContent = 'Please complete the highlighted fields.';
        first.focus();
        return;
      }
      submit.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Sending…';
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        status.textContent = '';
        wrap.classList.add('done');
        var s = wrap.querySelector('.success');
        if (s) { s.setAttribute('tabindex', '-1'); s.focus(); }
      }).catch(function () {
        submit.disabled = false;
        status.className = 'form-status error';
        status.textContent = 'Something went wrong. Please try again, or email lixonglobaldma@gmail.com directly.';
      });
    });
  });
})();
