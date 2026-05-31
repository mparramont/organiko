/*
 * Lightweight responsive image carousel.
 * Cross-fades through the <img> elements inside #slider, auto-advances,
 * pauses on hover/focus, and renders clickable navigation dots.
 * No dependencies; replaces the old domain-locked menucool slider.
 */
(function () {
  'use strict';

  function initSlider() {
    var slider = document.getElementById('slider');
    if (!slider) return;

    var images = Array.prototype.slice.call(slider.getElementsByTagName('img'));
    if (images.length === 0) return;

    var DELAY = 4000;
    var index = 0;
    var timer = null;

    // Build navigation dots.
    var dots = document.createElement('div');
    dots.className = 'slider-dots';

    var buttons = images.map(function (img, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Show slide ' + (i + 1));
      btn.addEventListener('click', function () {
        show(i);
        restart();
      });
      dots.appendChild(btn);
      return btn;
    });

    // Insert dots right after the slider.
    slider.parentNode.insertBefore(dots, slider.nextSibling);

    function show(n) {
      index = (n + images.length) % images.length;
      for (var i = 0; i < images.length; i++) {
        var on = i === index;
        images[i].classList.toggle('active', on);
        buttons[i].classList.toggle('active', on);
      }
    }

    function next() {
      show(index + 1);
    }

    function start() {
      if (images.length > 1 && timer === null) {
        timer = window.setInterval(next, DELAY);
      }
    }

    function stop() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function restart() {
      stop();
      start();
    }

    // Pause while the visitor is interacting with the slider.
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    dots.addEventListener('mouseenter', stop);
    dots.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
  } else {
    initSlider();
  }
})();
