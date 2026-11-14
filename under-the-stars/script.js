/* ==========================================================================
   UNDER THE STARS — experience logic
   Reads all words, names, photos and music settings from config.js.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.CONFIG;
  if (!C) {
    document.body.innerHTML = '<p style="color:#fff;padding:2rem;font-family:sans-serif">config.js did not load, so this page cannot start.</p>';
    return;
  }

  /* ---------- Helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var RM = function () { return mq.matches; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var get = function (o, path) { return path.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); };
  // In the single-file build, photos are embedded; asset() swaps a path for its embedded data.
  var ASSETS = window.ASSET_DATA || {};
  var asset = function (p) { return ASSETS[p] || p; };
  var fill = function (s) { return String(s == null ? '' : s).split('{her}').join(C.herName).split('{me}').join(C.myName); };

  var timers = [];
  function later(fn, ms) {
    var id = setTimeout(fn, RM() ? ms * 0.04 : ms);
    timers.push(id);
    return id;
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // force reflow so CSS animations replay
    el.classList.add(cls);
  }

  /* ---------- Fill text from config ---------- */
  document.title = fill(C.title) + ' — ' + fill(C.subtitle);
  $$('[data-text]').forEach(function (el) { el.textContent = fill(get(C, el.getAttribute('data-text'))); });
  $('#trackTitle').textContent = C.music.title;
  $('#trackArtist').textContent = C.music.artist;
  $('#fallbackLink').href = C.music.watchUrl;

  /* ==========================================================================
     SKY — stars, dust and shooting stars on one canvas
     ========================================================================== */
  var sky = (function () {
    var cv = $('#sky'), ctx = cv.getContext('2d');
    var aurora = $('.aurora');
    var W = 0, H = 0, stars = [], dust = [], shoot = null, nextShoot = 6;
    var px = 0, py = 0, tx = 0, ty = 0, pulse = 0, boostCur = 1, boostTarget = 1;
    var t0 = performance.now(), last = t0, running = false, playingFn = function () { return false; };
    var bpm = C.music.bpm || 63;

    function sprite(r, g, b) {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',1)');
      gr.addColorStop(0.25, 'rgba(' + r + ',' + g + ',' + b + ',.45)');
      gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
      x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
      return c;
    }
    var glowW = sprite(255, 246, 255), glowL = sprite(190, 160, 255), glowP = sprite(255, 175, 220);
    var palette = ['255,250,255', '255,250,255', '230,218,255', '205,188,255', '255,215,236', '200,214,255'];

    function seed() {
      var n = Math.round(clamp(W * H / 5000, 60, 280));
      stars = [];
      for (var i = 0; i < n; i++) {
        var big = Math.random() < 0.07;
        stars.push({
          x: Math.random() * W, y: Math.random() * H,
          r: big ? rand(1.1, 1.9) : rand(0.25, 1.05),
          a: rand(0.35, 0.95), tw: rand(0, 6.28), sp: rand(0.5, 1.8), z: rand(0.1, 1),
          delay: rand(0.2, 5.5), big: big, c: 'rgb(' + palette[(Math.random() * palette.length) | 0] + ')'
        });
      }
      dust = [];
      var d = W < 600 ? 20 : 38;
      for (i = 0; i < d; i++) {
        dust.push({ x: Math.random() * W, y: Math.random() * H, r: rand(1.2, 3.4), vy: -rand(4, 12), ph: rand(0, 6.28), a: rand(0.14, 0.4), spr: Math.random() < 0.5 ? glowL : glowP });
      }
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (RM() || !running) frame(t0 + 7000, true);
    }

    function frame(now, still) {
      var t = (now - t0) / 1000, dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      ctx.clearRect(0, 0, W, H);

      px += (tx - px) * 0.04; py += (ty - py) * 0.04;
      boostCur += (boostTarget - boostCur) * 0.02;
      var target = (!still && playingFn()) ? 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * bpm / 60) : 0;
      pulse += (target - pulse) * 0.06;
      if (aurora) aurora.style.opacity = (0.5 + 0.28 * pulse).toFixed(3);

      var i, s, a, x, y, r;
      for (i = 0; i < stars.length; i++) {
        s = stars[i];
        var fade = still ? 1 : clamp((t - s.delay) / 2.5, 0, 1);
        if (fade <= 0) continue;
        var tw = still ? 0.85 : 0.55 + 0.45 * Math.sin(t * s.sp + s.tw);
        a = clamp(s.a * tw * fade * boostCur * (1 + pulse * 0.5 * s.z), 0, 1);
        x = s.x + px * s.z * 18; y = s.y + py * s.z * 18;
        ctx.globalAlpha = a;
        if (s.big) { r = s.r * 7 * (1 + pulse * 0.25); ctx.drawImage(glowW, x - r, y - r, r * 2, r * 2); }
        ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill();
      }

      for (i = 0; i < dust.length; i++) {
        s = dust[i];
        if (!still) { s.y += s.vy * dt; if (s.y < -10) { s.y = H + 10; s.x = Math.random() * W; } }
        x = s.x + Math.sin(t * 0.3 + s.ph) * 12 + px * 24; y = s.y;
        r = s.r * 5;
        ctx.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(t * 0.8 + s.ph)) * clamp(t / 4, 0, 1) * (1 + pulse * 0.35);
        ctx.drawImage(s.spr, x - r, y - r, r * 2, r * 2);
      }

      if (!still) {
        if (!shoot && t > nextShoot) {
          var ang = rand(2.5, 2.9);
          shoot = { x: rand(W * 0.3, W * 1.05), y: rand(-20, H * 0.35), vx: Math.cos(ang) * 780, vy: Math.sin(ang) * 780, life: 0 };
          nextShoot = t + (boostTarget > 1.1 ? rand(2.5, 5) : rand(7, 15));
        }
        if (shoot) {
          shoot.life += dt; shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
          var k = shoot.life / 1.1, tl = 150;
          var ux = shoot.vx / 780, uy = shoot.vy / 780;
          var g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - ux * tl, shoot.y - uy * tl);
          g.addColorStop(0, 'rgba(255,250,255,1)'); g.addColorStop(1, 'rgba(190,160,255,0)');
          ctx.globalAlpha = clamp(1 - k, 0, 1) * 0.9;
          ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x - ux * tl, shoot.y - uy * tl); ctx.stroke();
          if (k >= 1) shoot = null;
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop(now) { if (!running) return; frame(now); requestAnimationFrame(loop); }

    function start() {
      if (RM()) { frame(t0 + 7000, true); return; }
      if (running) return;
      running = true; last = performance.now(); requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) { tx = (e.clientX / W - 0.5) * 2; ty = (e.clientY / H - 0.5) * 2; }, { passive: true });
    if (mq.addEventListener) mq.addEventListener('change', function () { if (RM()) { running = false; frame(t0 + 7000, true); } else start(); });
    resize(); start();

    return {
      boost: function (v) { boostTarget = v; },
      setPlaying: function (fn) { playingFn = fn; }
    };
  })();

  /* ==========================================================================
     MUSIC — official YouTube embedded player (nothing is downloaded or copied)
     ========================================================================== */
  var music = (function () {
    var M = C.music, player = null, ready = false, wantPlay = false, playing = false, failed = false, userPaused = false, started = false;
    var bar = $('#musicBar'), playBtn = $('#playBtn'), vol = $('#volume');
    var card = $('#playerCard'), fb = $('#playerFallback');

    function paintVol() { vol.style.setProperty('--v', vol.value + '%'); }
    vol.value = String(M.startVolume != null ? M.startVolume : 60); paintVol();

    function paint() {
      bar.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-pressed', String(playing));
      playBtn.setAttribute('aria-label', failed ? 'Open the song on YouTube' : (playing ? 'Pause music' : 'Play music'));
    }
    function showFallback(on) {
      failed = on; fb.hidden = !on; card.classList.toggle('failed', on); paint();
    }

    function load() {
      if (!M.youtubeId) { showFallback(true); return; }
      window.onYouTubeIframeAPIReady = function () {
        try {
          var vars = { playsinline: 1, rel: 0, modestbranding: 1, controls: 1, iv_load_policy: 3 };
          if (/^https?:$/.test(location.protocol)) vars.origin = location.origin;
          player = new window.YT.Player('ytPlayer', {
            videoId: M.youtubeId, width: '100%', height: '100%', playerVars: vars,
            events: {
              onReady: function () {
                ready = true; showFallback(false);
                try { player.setVolume(+vol.value); } catch (e) { /* ignore */ }
                if (wantPlay && !userPaused) play();
              },
              onStateChange: function (e) {
                var S = window.YT.PlayerState;
                if (e.data === S.PLAYING) { playing = true; started = true; }
                else if (e.data === S.PAUSED || e.data === S.ENDED) { playing = false; }
                paint();
              },
              onError: function () { showFallback(true); }
            }
          });
        } catch (err) { showFallback(true); }
      };
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api'; tag.async = true;
      tag.onerror = function () { showFallback(true); };
      document.head.appendChild(tag);
      setTimeout(function () { if (!ready) showFallback(true); }, 12000);
    }

    function play() { if (ready && player) { try { player.playVideo(); } catch (e) { /* ignore */ } } }
    function pause() { if (ready && player) { try { player.pauseVideo(); } catch (e) { /* ignore */ } } }

    playBtn.addEventListener('click', function () {
      if (failed || !ready) {
        if (failed) window.open(M.watchUrl, '_blank', 'noopener');
        else { wantPlay = true; userPaused = false; }
        return;
      }
      if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); }
    });
    vol.addEventListener('input', function () {
      paintVol();
      if (ready && player) { try { player.setVolume(+vol.value); if (+vol.value > 0 && player.isMuted()) player.unMute(); } catch (e) { /* ignore */ } }
    });

    load(); paint();
    sky.setPlaying(function () { return playing; });

    return {
      // Must be called from a real tap/click (browser autoplay rules).
      start: function () { wantPlay = true; userPaused = false; play(); },
      // Gentle retry on later taps if a strict browser blocked the first attempt.
      nudge: function () { if (wantPlay && ready && !playing && !userPaused && !started) play(); }
    };
  })();

  /* ==========================================================================
     SCENE MANAGER
     ========================================================================== */
  var scenes = $$('.scene');
  var hooks = {};
  var cur = -1, maxReached = 0;
  var dotsEl = $('#dots'), navBack = $('#navBack');

  C.ui.sceneNames.forEach(function (name, i) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Scene ' + (i + 1) + ': ' + name);
    b.addEventListener('click', function () { goTo(i); });
    li.appendChild(b); dotsEl.appendChild(li);
  });

  function updateNav() {
    $$('button', dotsEl).forEach(function (b, i) {
      b.disabled = i > maxReached || (i === 0 && cur !== 0);
      b.classList.toggle('visited', i <= maxReached);
      if (i === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    navBack.hidden = cur <= 1;
  }

  function goTo(i, opts) {
    var force = opts && opts.force;
    if (i === cur || i < 0 || i >= scenes.length) return;
    if (i > maxReached && !force) return;
    var prev = cur;
    cur = i; maxReached = Math.max(maxReached, i);
    clearTimers();
    if (prev >= 0) {
      scenes[prev].classList.remove('active');
      scenes[prev].inert = true;
      if (hooks[prev] && hooks[prev].leave) hooks[prev].leave();
    }
    var el = scenes[i];
    el.inert = false; el.scrollTop = 0;
    document.body.setAttribute('data-scene', String(i));
    sky.boost(i === 6 ? 1.45 : 1);
    requestAnimationFrame(function () { el.classList.add('active'); });
    if (hooks[i] && hooks[i].enter) hooks[i].enter();
    updateNav();
  }

  document.addEventListener('click', function (e) {
    music.nudge();
    var n = e.target.closest('[data-next]');
    if (n) goTo(cur + 1, { force: true });
  });
  navBack.addEventListener('click', function () { if (cur > 1) goTo(cur - 1); });
  document.addEventListener('keydown', function (e) {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (cur === 5 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { lyric.step(e.key === 'ArrowRight' ? 1 : -1, true); return; }
    if (e.key === 'ArrowRight') goTo(cur + 1);
    if (e.key === 'ArrowLeft' && cur > 1) goTo(cur - 1);
  });

  /* ==========================================================================
     SCENE 1 — OPENING
     ========================================================================== */
  var envelope = $('#envelope');
  hooks[0] = {
    enter: function () {
      var s = scenes[0], l1 = $('#line1'), l2 = $('#line2'), btn = $('#openBtn');
      s.classList.remove('opened'); btn.disabled = false;
      [l1, l2, btn].forEach(function (e) { e.classList.remove('show'); });
      later(function () { l1.classList.add('show'); }, 1500);
      later(function () { l2.classList.add('show'); }, 5200);
      later(function () { btn.classList.add('show'); btn.classList.add('pulse'); }, 6600);
    }
  };
  $('#openBtn').addEventListener('click', function () {
    this.disabled = true; this.classList.remove('pulse');
    music.start(); // inside the tap, so browsers allow sound
    document.body.classList.add('music-on');
    scenes[0].classList.add('opened');
    preloadPhotos();
    later(function () { goTo(1, { force: true }); }, 2500);
  });

  /* ==========================================================================
     SCENE 3 — PHOTOGRAPH REVEAL
     ========================================================================== */
  var herPhotos = C.photos.her || [];
  var stack = $('#photoStack'), thumbs = $('#thumbs'), stage = $('#revealStage'), frameWrap = $('.frame-wrap');
  var imgs = [], photoIdx = 0;

  function photoFallback(host, label) {
    var d = document.createElement('div'); d.className = 'photo-fallback'; d.textContent = (label || '✦').charAt(0);
    host.appendChild(d);
  }
  herPhotos.forEach(function (p, i) {
    var im = document.createElement('img');
    im.src = asset(p.src); im.alt = fill(p.alt || ''); im.decoding = 'async'; im.draggable = false;
    im.addEventListener('error', function () { im.remove(); photoFallback(stack, C.herName); });
    stack.appendChild(im); imgs.push(im);
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Photograph ' + (i + 1));
    var t = document.createElement('img'); t.src = asset(p.src); t.alt = ''; t.loading = 'lazy';
    b.appendChild(t); b.addEventListener('click', function () { showPhoto(i); });
    thumbs.appendChild(b);
  });
  if (herPhotos.length < 2) { frameWrap.classList.add('single'); thumbs.hidden = true; }

  function showPhoto(i) {
    if (!imgs.length) return;
    photoIdx = (i + imgs.length) % imgs.length;
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === photoIdx); });
    $$('button', thumbs).forEach(function (b, k) { b.setAttribute('aria-selected', String(k === photoIdx)); });
  }
  $('#photoPrev').addEventListener('click', function () { showPhoto(photoIdx - 1); });
  $('#photoNext').addEventListener('click', function () { showPhoto(photoIdx + 1); });

  // Parallax tilt (mouse and touch) and swipe
  var frameEl = $('#frame'), swipeX = null;
  window.addEventListener('pointermove', function (e) {
    if (cur !== 2 || RM()) return;
    stage.style.setProperty('--px', (clamp(e.clientX / window.innerWidth, 0, 1) * 2 - 1).toFixed(3));
    stage.style.setProperty('--py', (clamp(e.clientY / window.innerHeight, 0, 1) * 2 - 1).toFixed(3));
  }, { passive: true });
  frameEl.addEventListener('pointerdown', function (e) { swipeX = e.clientX; });
  window.addEventListener('pointerup', function (e) {
    if (swipeX == null) return;
    var dx = e.clientX - swipeX; swipeX = null;
    if (Math.abs(dx) > 45) showPhoto(photoIdx + (dx < 0 ? 1 : -1));
  });
  window.addEventListener('pointercancel', function () { swipeX = null; });

  // Floating stars around the frame
  function scatter(host, n) {
    for (var i = 0; i < n; i++) {
      var s = document.createElement('i');
      s.style.cssText = '--x:' + rand(0, 98).toFixed(1) + '%;--y:' + rand(0, 98).toFixed(1) + '%;--s:' + rand(3, 9).toFixed(1) + 'px;--d:' + rand(5, 11).toFixed(1) + 's;--dl:' + (-rand(0, 8)).toFixed(1) + 's;--dx:' + rand(-12, 12).toFixed(0) + 'px;--dy:' + rand(-18, 8).toFixed(0) + 'px';
      host.appendChild(s);
    }
  }
  scatter($('.float-stars.far'), 16); scatter($('.float-stars.near'), 8);

  hooks[2] = {
    enter: function () {
      var line = $('#revealLine');
      line.classList.remove('show');
      showPhoto(0);
      if (RM()) stage.classList.add('static'); else restart(stage, 'go');
      later(function () { line.classList.add('show'); }, 2300);
    },
    leave: function () { stage.classList.remove('go'); }
  };

  /* ==========================================================================
     SCENE 4 — OUR LITTLE UNIVERSE
     ========================================================================== */
  (function () {
    var title = $('#duoTitle'), parts = fill(C.universe.title).split('&');
    if (parts.length === 2) {
      var amp = document.createElement('span'); amp.className = 'amp'; amp.textContent = '&';
      title.appendChild(document.createTextNode(parts[0].trim())); title.appendChild(amp); title.appendChild(document.createTextNode(parts[1].trim()));
    } else { title.textContent = fill(C.universe.title); }
    var me = $('#duoMe'), her = $('#duoHer');
    me.src = asset(C.photos.duoMe); me.alt = C.myName; her.src = asset(C.photos.duoHer); her.alt = C.herName;
    me.addEventListener('error', function () { me.remove(); });
    her.addEventListener('error', function () { her.remove(); });
    $('#capMe').textContent = C.myName; $('#capHer').textContent = C.herName;
  })();
  hooks[3] = {
    enter: function () {
      var wrap = $('#duoWrap'), t = $('#duoTitle'), cap = $('#duoCaption'), btn = $('#scene-3 .btn');
      [t, cap, btn].forEach(function (e) { e.classList.remove('show'); });
      wrap.classList.remove('go');
      later(function () { restart(wrap, 'go'); }, 350);
      later(function () { t.classList.add('show'); }, 400);
      later(function () { cap.classList.add('show'); }, 4600);
      later(function () { btn.classList.add('show'); }, 5400);
    },
    leave: function () { $('#duoWrap').classList.remove('go'); }
  };

  /* ==========================================================================
     SCENE 5 — LETTER
     ========================================================================== */
  var letter = $('#letter'), lBody = $('#letterBody'), readBtn = $('#readBtn'), letterNext = $('#letterNext');
  $('#foldLabel').textContent = fill(C.letter.closedLabel);
  C.letter.paragraphs.forEach(function (t) {
    var p = document.createElement('p'); p.textContent = fill(t); lBody.appendChild(p);
  });
  var userScrolled = false;
  ['wheel', 'touchstart', 'pointerdown'].forEach(function (ev) { lBody.addEventListener(ev, function () { userScrolled = true; }, { passive: true }); });

  hooks[4] = {
    enter: function () {
      letter.classList.remove('read'); readBtn.classList.remove('gone'); readBtn.disabled = false;
      letterNext.classList.remove('show'); lBody.scrollTop = 0; userScrolled = false;
      $$('p', lBody).forEach(function (p) { p.classList.remove('in'); });
    }
  };
  readBtn.addEventListener('click', function () {
    letter.classList.add('read'); readBtn.classList.add('gone'); readBtn.disabled = true;
    var ps = $$('p', lBody), step = 1900;
    ps.forEach(function (p, i) {
      later(function () {
        p.classList.add('in');
        if (!userScrolled) {
          var bottom = p.offsetTop + p.offsetHeight;
          if (bottom > lBody.scrollTop + lBody.clientHeight - 24) lBody.scrollTo({ top: bottom - lBody.clientHeight + 40, behavior: RM() ? 'auto' : 'smooth' });
        }
      }, 1000 + i * step);
    });
    later(function () { letterNext.classList.add('show'); }, 1000 + ps.length * step + 600);
  });

  /* ==========================================================================
     SCENE 6 — ORIGINAL DEDICATION
     ========================================================================== */
  var lyric = (function () {
    var stanzas = C.dedication.stanzas, stageEl = $('#lyricStage'), dotsHost = $('#lyricDots');
    var prevB = $('#lyricPrev'), nextB = $('#lyricNextBtn'), cont = $('#dedicationNext');
    var idx = -1, auto = true, timer = null;
    stanzas.forEach(function () { dotsHost.appendChild(document.createElement('i')); });

    function words(str) { return fill(str).split(' '); }

    function show(i) {
      i = clamp(i, 0, stanzas.length - 1);
      clearTimeout(timer);
      var old = $('.stanza:not(.out)', stageEl);
      if (old) { old.classList.add('out'); setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 700); }
      var S = stanzas[i], el = document.createElement('div'), n = 0;
      el.className = 'stanza ' + S.type;
      S.lines.forEach(function (line) {
        var ln = document.createElement('span'); ln.className = 'ln';
        var ws = words(line);
        ws.forEach(function (w, k) {
          var sp = document.createElement('span'); sp.className = 'w'; sp.style.setProperty('--i', n++);
          sp.textContent = w + (k < ws.length - 1 ? ' ' : ''); ln.appendChild(sp);
        });
        el.appendChild(ln);
      });
      stageEl.appendChild(el);
      idx = i;
      $$('i', dotsHost).forEach(function (d, k) { d.classList.toggle('on', k === i); });
      prevB.disabled = i === 0; nextB.disabled = i === stanzas.length - 1;
      prevB.style.opacity = prevB.disabled ? 0.3 : 1; nextB.style.opacity = nextB.disabled ? 0.3 : 1;
      if (i === stanzas.length - 1) later(function () { cont.classList.add('show'); }, 2600);
      else if (auto && !RM()) timer = later(function () { show(idx + 1); }, 3000 + n * 430);
    }

    prevB.addEventListener('click', function () { step(-1, true); });
    nextB.addEventListener('click', function () { step(1, true); });
    stageEl.addEventListener('click', function () { step(1, true); });

    function step(d, manual) {
      if (manual) auto = false;
      var n = idx + d;
      if (n < 0 || n > stanzas.length - 1) return;
      show(n);
    }

    hooks[5] = {
      enter: function () {
        auto = true; idx = -1; cont.classList.remove('show');
        stageEl.innerHTML = '';
        later(function () { show(0); }, 900);
      },
      leave: function () { clearTimeout(timer); }
    };
    return { step: step };
  })();

  /* ==========================================================================
     SCENE 7 — FINAL SURPRISE
     ========================================================================== */
  (function () {
    // Name in glowing script
    var l1 = $('#fLine1'), txt = fill(C.finale.line1), at = txt.indexOf(C.herName);
    if (at >= 0) {
      l1.appendChild(document.createTextNode(txt.slice(0, at)));
      var nm = document.createElement('span'); nm.className = 'glow-name'; nm.textContent = C.herName; l1.appendChild(nm);
      l1.appendChild(document.createTextNode(txt.slice(at + C.herName.length)));
    } else { l1.textContent = txt; }

    var sign = $('#fSign');
    sign.appendChild(document.createTextNode(fill(C.finale.signoff[0])));
    var b = document.createElement('b'); b.textContent = fill(C.finale.signoff[1]); sign.appendChild(b);

    // Constellation heart
    var NS = 'http://www.w3.org/2000/svg', svg = $('#heart'), N = 18, pts = [], i;
    for (i = 0; i < N; i++) {
      var t = Math.PI + (i / N) * Math.PI * 2;
      var hx = 16 * Math.pow(Math.sin(t), 3);
      var hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push([60 + hx * 3.1, 58 - hy * 3.1]);
    }
    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<radialGradient id="heartGrad" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffd9ee" stop-opacity=".9"/><stop offset="1" stop-color="#b58cff" stop-opacity=".15"/></radialGradient>';
    svg.appendChild(defs);
    var fillP = document.createElementNS(NS, 'path');
    fillP.setAttribute('class', 'hfill');
    fillP.setAttribute('d', 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + 'Z');
    svg.appendChild(fillP);
    for (i = 0; i < N; i++) {
      var a = pts[i], c = pts[(i + 1) % N];
      var ln = document.createElementNS(NS, 'line');
      ln.setAttribute('class', 'hl');
      ln.setAttribute('x1', a[0].toFixed(1)); ln.setAttribute('y1', a[1].toFixed(1));
      ln.setAttribute('x2', c[0].toFixed(1)); ln.setAttribute('y2', c[1].toFixed(1));
      ln.style.setProperty('--len', Math.hypot(c[0] - a[0], c[1] - a[1]).toFixed(1));
      ln.style.setProperty('--dl', (i * 0.17 + 0.15).toFixed(2) + 's');
      svg.appendChild(ln);
    }
    for (i = 0; i < N; i++) {
      var st = document.createElementNS(NS, 'circle');
      st.setAttribute('class', 'hs'); st.setAttribute('cx', pts[i][0].toFixed(1)); st.setAttribute('cy', pts[i][1].toFixed(1));
      st.setAttribute('r', (i % 3 === 0 ? 1.9 : 1.2).toString());
      st.style.setProperty('--dl', (i * 0.17).toFixed(2) + 's');
      svg.appendChild(st);
    }

    var heartDone = N * 0.17 + 0.8;
    hooks[6] = {
      enter: function () {
        var l2 = $('#fLine2'), btn = $('#replayBtn');
        [l1, l2, sign, btn].forEach(function (e) { e.classList.remove('show'); });
        svg.classList.remove('go', 'done');
        later(function () { l1.classList.add('show'); }, 1000);
        later(function () { l2.classList.add('show'); }, 5200);
        later(function () { sign.classList.add('show'); }, 9000);
        later(function () { restart(svg, 'go'); }, 12000);
        later(function () { svg.classList.add('done'); }, 12000 + heartDone * 1000);
        later(function () { btn.classList.add('show'); }, 12000 + heartDone * 1000 + 800);
      },
      leave: function () { svg.classList.remove('go', 'done'); }
    };
    $('#replayBtn').addEventListener('click', function () {
      maxReached = 0; goTo(0, { force: true });
    });
  })();

  /* ---------- Photo preload (after the first tap, so the reveal is instant) ---------- */
  var preloaded = false;
  function preloadPhotos() {
    if (preloaded) return; preloaded = true;
    [C.photos.duoMe, C.photos.duoHer].concat(herPhotos.map(function (p) { return p.src; })).forEach(function (src) { var i = new Image(); i.src = asset(src); });
  }

  /* ---------- Start ---------- */
  goTo(0, { force: true });
  setTimeout(function () { document.body.classList.add('ready'); }, 250);
})();
