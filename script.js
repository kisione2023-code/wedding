(function () {
  "use strict";

  var scene = document.getElementById("scene1");
  var panTrack = document.getElementById("panTrack");
  var overlay = document.getElementById("scene2Layer");
  var overlay3 = document.getElementById("scene3Layer");
  var ladyInner = document.getElementById("ladyInner");
  var ladyStand = document.querySelector(".scene__lady-img--stand");
  var ladyLean = document.querySelector(".scene__lady-img--lean");
  var candy = document.getElementById("candyImg");
  var candyWrap = document.querySelector(".scene__candy-wrap");
  var candyTargets = [candy, candyWrap].filter(Boolean);
  var candyVideo = document.getElementById("candyVideo");
  var fireflies = document.getElementById("firefliesLayer");
  var ladyLayer = document.getElementById("ladyLayer");
  var scrollHint = document.querySelector(".scroll-hint");
  var candyHint = document.querySelector(".candy-hint");
  var candyCoverCloseBtn = document.querySelector(".candy-cover-close");
  var horizontalHint = document.getElementById("horizontalHint");
  var scene5ManWalk = document.getElementById("scene5ManWalk");
  var scene5Man2 = document.getElementById("scene5Man2");
  var scene5ManWrap = document.querySelector(".scene5__man1-wrap");
  var forestLetter = document.getElementById("forestLetter");
  var forestLetterHint = document.querySelector(".forest-letter-hint");
  var letterModal = document.getElementById("letterModal");
  var letterModalBackdrop =
    letterModal && letterModal.querySelector(".letter-modal__backdrop");
  var letterModalPanel =
    letterModal && letterModal.querySelector(".letter-modal__panel");
  var letterModalCloseBtn =
    letterModal && letterModal.querySelector(".letter-modal__close");

  if (!scene || !panTrack || !overlay) return;

  gsap.registerPlugin(ScrollTrigger);

  var scrollHintHidden = false;
  window.addEventListener("scroll", function () {
    if (scrollHintHidden || !scrollHint || window.scrollY <= 50) return;

    scrollHintHidden = true;
    gsap.to(scrollHint, {
      opacity: 0,
      y: 10,
      duration: 0.35,
      ease: "power2.out",
      onComplete: function () {
        scrollHint.style.visibility = "hidden";
      }
    });
  }, { passive: true });

  function initFlowerSubscriptionTapHint() {
    var flowerLink = document.querySelector(".letter-link--flower");
    if (!flowerLink) return;

    var flowerWrap = flowerLink.closest(".flower-link-wrap");
    if (!flowerWrap) return;

    var touchQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    var closeTimer = 0;

    function closeHint() {
      flowerWrap.classList.remove("is-tooltip-open");
      flowerLink.removeAttribute("data-tap-ready");
      flowerLink.setAttribute("aria-expanded", "false");
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = 0;
      }
    }

    function openHint() {
      flowerWrap.classList.add("is-tooltip-open");
      flowerLink.setAttribute("data-tap-ready", "true");
      flowerLink.setAttribute("aria-expanded", "true");
      flowerLink.focus({ preventScroll: true });

      if (closeTimer) window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(closeHint, 7000);
    }

    flowerLink.setAttribute("aria-expanded", "false");

    flowerLink.addEventListener("click", function (e) {
      if (!touchQuery.matches || e.detail === 0) return;

      if (flowerLink.getAttribute("data-tap-ready") === "true") {
        closeHint();
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      openHint();
    });

    document.addEventListener("click", function (e) {
      if (!touchQuery.matches || flowerWrap.contains(e.target)) return;
      closeHint();
    });
  }

  initFlowerSubscriptionTapHint();

  /* ============================================================
     Позиционирование персонажа — логика

     State 1 (старт):
       ladyInner стоит у левого края scene__sticky (left:0 в CSS)
       translateX = 0 — персонаж НЕ двигается до начала scene3

     State 2 (движение):
       Сдвиг вправо на containerWidth * 0.30–0.35
       Это зона «середина-лево» / золотое сечение экрана
       Не центр — персонаж остаётся на левой трети сцены

     State 3 (финал):
       Ещё чуть правее: containerWidth * 0.38–0.42
       Здесь происходит кроссфейд lady → lady2 (наклон)
       Позиция визуально совпадает с тропинкой на сцене 3

     Все значения — доли от ширины контейнера, НЕ фиксированные px.
     ============================================================ */

  var MOVE_START_RATIO = 0.30;   // начало движения (30% ширины контейнера)
  var MOVE_END_RATIO   = 0.38;   // конец движения (38% — чуть правее)
  var CROSSFADE_IN_RATIO  = 0.50;  // кроссфейд начинается на середине движения
  var CROSSFADE_OUT_RATIO = 0.85;  // кроссфейд завершается к концу движения

  /* ---------- Сцена: тайминги фаз ---------- */
  var PAN_END       = 0.55;  // панорама 1-й сцены
  var SCENE2_SHARE  = 0.5;   // доля скролла на fade-in сцены 2
  var scene2End     = PAN_END + (1 - PAN_END) * SCENE2_SHARE; // 0.775
  var scene3Start   = scene2End; // 0.775 — с этого момента видна сцена 3

  /* ---------- Персонаж: когда начинает ехать ---------- */
  var LADY_PHASE3_START = 0.18;  // 18% от фазы сцены 3
  var LADY_PHASE3_END   = 0.98;  // 98% от фазы сцены 3 — до самого конца (нет пустого скролла)
  var ladyStartP = scene3Start + (1 - scene3Start) * LADY_PHASE3_START; // ≈ 0.816
  var ladyEndP   = scene3Start + (1 - scene3Start) * LADY_PHASE3_END;   // ≈ 0.996
  var ladyDuration = ladyEndP - ladyStartP;

  /* ---------- Светлячки ---------- */
  var FIREFLY_PAN_START = 0.78;
  var fireflyStart = FIREFLY_PAN_START * PAN_END; // ≈ 0.43

  /* ---------- Функция расчёта сдвига ---------- */
  function getMoveDistance() {
    var container = document.querySelector(".scene__sticky");
    if (!container) return 0;
    return container.getBoundingClientRect().width;
  }

  function getLadyMotion() {
    var containerWidth = getMoveDistance();
    var width = window.innerWidth;
    var height = window.innerHeight;
    var startRatio = MOVE_START_RATIO;
    var endRatio = MOVE_END_RATIO;
    var endOffset = 120;
    var endY = 30;

    if (width <= 700 && width < height) {
      startRatio = 0.06;
      endRatio = 0.10;
      endOffset = 0;
      endY = 34;
    } else if (height <= 520) {
      startRatio = 0.16;
      endRatio = 0.22;
      endOffset = 30;
      endY = 24;
    }

    return {
      midX: containerWidth * startRatio,
      endX: containerWidth * endRatio - endOffset,
      endY: endY
    };
  }

  /* ---------- Мастер-таймлайн ---------- */
  var master = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });

  /* 1. Панорама первой сцены */
  var vh = window.innerHeight;
  var panHeight = panTrack.offsetHeight;
  var maxPan = Math.max(0, panHeight - vh);
  var PATH_CENTER_RATIO = 0.88;
  master.to(
    panTrack,
    { y: -maxPan * PATH_CENTER_RATIO, ease: "none", duration: PAN_END }
  );

  /* 2. Появление второй сцены */
  var scene2Start = PAN_END;
  master.to(
    overlay,
    { opacity: 1, scaleX: 1.025, scaleY: 1.025, ease: "power1.inOut", duration: scene2End - scene2Start },
    scene2Start
  );

  /* 3. Появление третьей сцены */
  master.to(
    overlay3,
    { opacity: 1, scaleX: 1.025, scaleY: 1.025, ease: "power1.inOut", duration: 1 - scene3Start },
    scene3Start
  );

  /* 4. Светлячки */
  master.to(
    fireflies,
    { opacity: 1, visibility: "visible", ease: "power1.inOut", duration: 1 - fireflyStart },
    fireflyStart
  );

  /* 5. Персонаж: 3 фазы — въезд → пауза → финал + кроссфейд */

  // Длительности фаз (доли от ladyDuration)
  var PHASE1_RATIO = 0.65;   // медленный въезд
  var PHASE2_RATIO = 0.13;   // пауза
  var PHASE3_RATIO = 0.22;   // финальный рывок

  // Скрыт до начала scene3, затем плавное появление
  master.set(ladyInner, { opacity: 0 }, ladyStartP - 0.001);
  master.to(
    ladyInner,
    { opacity: 1, duration: 0.06, ease: "power1.inOut" },
    ladyStartP
  );

  // --- Фаза 1: медленный въезд слева → midX ---
  master.to(
    ladyInner,
    { x: function () { return getLadyMotion().midX; }, y: 0, ease: "none", duration: ladyDuration * PHASE1_RATIO },
    ladyStartP + 0.06
  );

  // --- Фаза 2: пауза (нет движения, только время) ---
  // Позиция не меняется — просто «заполнитель» длительности
  master.to(
    ladyInner,
    { x: function () { return getLadyMotion().midX; }, y: 0, ease: "none", duration: ladyDuration * PHASE2_RATIO },
    ladyStartP + 0.06 + ladyDuration * PHASE1_RATIO
  );

  // --- Фаза 3: финальный рывок midX → endX ---
  var phase3Start = ladyStartP + 0.06 + ladyDuration * (PHASE1_RATIO + PHASE2_RATIO);
  master.to(
    ladyInner,
    {
      x: function () { return getLadyMotion().endX; },
      y: function () { return getLadyMotion().endY; },
      ease: "power2.out",
      duration: ladyDuration * PHASE3_RATIO
    },
    phase3Start
  );

  // Кроссфейд: standing → lady2 leaning — ТОЛЬКО в фазе 3
  var crossfadeStartP = phase3Start + ladyDuration * PHASE3_RATIO * 0.15;
  var crossfadeDur    = ladyDuration * PHASE3_RATIO * 0.75;

  master.to(
    ladyStand,
    { opacity: 0, ease: "power1.inOut", duration: crossfadeDur },
    crossfadeStartP
  );

  master.fromTo(
    ladyLean,
    { opacity: 0 },
    { opacity: 1, ease: "power1.inOut", duration: crossfadeDur },
    crossfadeStartP
  );

  // Конфета: только opacity — позиционирована через CSS внутри lady2-wrap
  // Появляется синхронно с кроссфейдом lady→lady2
  master.set(candy, { opacity: 0 }, crossfadeStartP - 0.001);
  master.set(candyTargets, { pointerEvents: "none" }, crossfadeStartP - 0.001);
  master.set(candyHint, { clearProps: "all" }, crossfadeStartP - 0.002);
  master.set(candyHint, { display: "flex", opacity: 0 }, crossfadeStartP - 0.001);
  master.to(
    candy,
    { opacity: 1, ease: "power1.inOut", duration: crossfadeDur * 0.5 },
    crossfadeStartP
  );
  master.set(candyTargets, { pointerEvents: "auto" }, crossfadeStartP + crossfadeDur * 0.5);
  master.to(
    candyHint,
    { opacity: 1, ease: "power2.out", duration: crossfadeDur * 0.45 },
    crossfadeStartP + crossfadeDur * 0.2
  );

  /* ---------- Resize: пересчёт ---------- */
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      ScrollTrigger.refresh();
      if (horizontalMode) updateHorizontalHintVisibility();
    }, 150);
  });

  /* ---------- Клик по конфете → видео ---------- */
  var candyAnimating = false;
  var coverWrap = document.getElementById("coverCandyWrap");
  var coverCandyEl = document.getElementById("coverCandy");
  var freeCandyEl = document.getElementById("freeCandy");
  function onCoverBgDecoded() {
    try {
      positionFreeCandy();
      ScrollTrigger.refresh();
    } catch (e) {
      /* не даём упасть всей инициализации — ниже должен навеситься клик на конфету */
    }
  }
  if (coverCandyEl) {
    coverCandyEl.addEventListener("load", onCoverBgDecoded);
    /* Синхронный вызов здесь может выбросить до регистрации клика; отложим на кадр */
    if (coverCandyEl.complete && coverCandyEl.naturalWidth) {
      requestAnimationFrame(onCoverBgDecoded);
    }
  }
  var bgLayers = [
    panTrack,
    overlay,
    overlay3,
    ladyLayer,
    fireflies
  ];

  function lockScroll() {
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    document.body.style.overflow = "";
  }

  var letterModalOpen = false;

  function onLetterModalKeydown(e) {
    if (!letterModalOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeForestLetterModal();
    }
  }

  function openForestLetterModal() {
    if (
      letterModalOpen ||
      !letterModal ||
      !letterModalBackdrop ||
      !letterModalPanel
    )
      return;
    letterModalOpen = true;
    lockScroll();

    gsap.killTweensOf([letterModalBackdrop, letterModalPanel]);
    if (forestLetterHint) gsap.killTweensOf(forestLetterHint);

    letterModal.setAttribute("aria-hidden", "false");
    gsap.set(letterModal, { visibility: "visible", pointerEvents: "auto" });
    gsap.set(letterModalBackdrop, { opacity: 0 });
    gsap.set(letterModalPanel, { opacity: 0, scale: 0.96 });

    gsap.to(letterModalBackdrop, {
      opacity: 1,
      duration: 0.38,
      ease: "power2.out",
    });

    gsap.to(letterModalPanel, {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      ease: "power2.out",
    });

    if (forestLetterHint) {
      gsap.to(forestLetterHint, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      });
    }

    document.addEventListener("keydown", onLetterModalKeydown);
  }

  function closeForestLetterModal() {
    if (
      !letterModalOpen ||
      !letterModal ||
      !letterModalBackdrop ||
      !letterModalPanel
    )
      return;
    letterModalOpen = false;
    document.removeEventListener("keydown", onLetterModalKeydown);

    gsap.killTweensOf([letterModalBackdrop, letterModalPanel]);
    if (forestLetterHint) gsap.killTweensOf(forestLetterHint);

    gsap
      .timeline({
        onComplete: function () {
          gsap.set(letterModal, { visibility: "hidden", pointerEvents: "none" });
          gsap.set(letterModalBackdrop, { opacity: 0 });
          gsap.set(letterModalPanel, { opacity: 0, scale: 0.96 });
          letterModal.setAttribute("aria-hidden", "true");
          unlockScroll();
          ScrollTrigger.refresh();
          if (forestLetterHint) {
            gsap.killTweensOf(forestLetterHint);
            gsap.to(forestLetterHint, {
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        },
      })
      .to(
        letterModalPanel,
        { opacity: 0, scale: 0.96, duration: 0.3, ease: "power2.in" },
        0
      )
      .to(
        letterModalBackdrop,
        { opacity: 0, duration: 0.35, ease: "power2.in" },
        0
      );
  }

  if (forestLetter && letterModal) {
    forestLetter.addEventListener("click", function (e) {
      e.preventDefault();
      openForestLetterModal();
    });
  }

  if (letterModalBackdrop) {
    letterModalBackdrop.addEventListener("click", function () {
      closeForestLetterModal();
    });
  }

  if (letterModalCloseBtn) {
    letterModalCloseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeForestLetterModal();
    });
  }

  function positionFreeCandy() {
    if (!coverWrap || !coverCandyEl || !freeCandyEl) return;

    var wrapRect = coverWrap.getBoundingClientRect();
    var coverPaper = coverCandyEl.closest(".paper-layout--cover");
    var coverRect = (coverPaper || coverCandyEl).getBoundingClientRect();
    if (!wrapRect.width || !coverRect.width) return;

    var candyRatio = 0.24;
    if (window.innerWidth <= 900) candyRatio = 0.30;
    if (window.innerWidth <= 600) candyRatio = 0.34;

    var candySize = Math.max(120, Math.min(coverRect.width * candyRatio, 360));
    var anchorX = 0.9;
    var anchorY = 0.68;
    var left = coverRect.left - wrapRect.left + coverRect.width * anchorX;
    var top = coverRect.top - wrapRect.top + coverRect.height * anchorY;

    left -= candySize / 2;
    top -= candySize / 2;

    gsap.set(freeCandyEl, {
      width: candySize,
      left: left,
      top: top,
      right: "auto",
      bottom: "auto"
    });
  }

  function showCover() {
    var tl = gsap.timeline();

    tl.set("#coverCandyWrap", {
      visibility: "visible",
      scale: 0.96,
      pointerEvents: "auto",
    });
    tl.set("#freeCandy", { visibility: "visible" });
    positionFreeCandy();

    tl.to("#coverCandyWrap", {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });

    tl.fromTo("#freeCandy",
      { opacity: 0, y: -40, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" },
      0.2
    );

    tl.to("#freeCandy", {
      y: "+=7",
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    }, 0.6);

    tl.add(function () {
      showHorizontalHint();
    }, 0.35);
  }

  let horizontalMode = false;
  let currentX = 0;
  let horizontalStarted = false;
  let horizontalHintHiddenAtEnd = false;
  let scene5Started = false;

  function revealForestLetterHint(delay) {
    if (!forestLetterHint) return;
    gsap.killTweensOf(forestLetterHint);
    gsap.to(forestLetterHint, {
      opacity: 1,
      duration: 0.45,
      ease: "power2.out",
      delay: delay || 0,
    });
  }

  function scene5ManFinalFits(finalVars) {
    if (!scene5ManWrap) return true;

    gsap.set(scene5ManWrap, finalVars);

    var rect = scene5ManWrap.getBoundingClientRect();
    var padding = Math.min(24, Math.max(10, window.innerWidth * 0.03));

    return (
      rect.left >= padding &&
      rect.right <= window.innerWidth - padding &&
      rect.top >= padding &&
      rect.bottom <= window.innerHeight - padding
    );
  }

  function startScene5ManAutoWalk() {
    if (!scene5ManWrap || !scene5ManWalk) return;

    gsap.killTweensOf([scene5ManWrap, scene5ManWalk]);
    if (scene5Man2) {
      gsap.killTweensOf(scene5Man2);
    }

    /* Старт на дальней тропинке; движение диагонально вниз справа налево к man2. */
    var p1From = {
      transformOrigin: "50% 100%",
      force3D: true,
      x: "5vh",
      y: "-25vh",
      scale: 1.25,
    };

    var p1ToTransform = {
      transformOrigin: "50% 100%",
      force3D: true,
      x: "-27vh",
      y: "4vh",
      scale: 2.16,
    };

    var p2Transform = {
      transformOrigin: "50% 100%",
      force3D: true,
      x: "8vh",
      y: "4vh",
      scale: 2.24,
    };

    if (!scene5ManFinalFits(p1ToTransform)) {
      p1ToTransform = {
        transformOrigin: "50% 100%",
        force3D: true,
        x: "8vh",
        y: "4vh",
        scale: 2.16,
      };

      p2Transform = Object.assign({}, p1ToTransform, { x: "13vh", scale: 2.24 });
    }

    var p1To = Object.assign({}, p1ToTransform, {
      duration: 2.8,
      ease: "power2.out",
      onComplete: function () {
        gsap.killTweensOf(scene5ManWalk);

        if (!scene5Man2) {
          gsap.to(scene5ManWrap, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: function () {
              revealForestLetterHint(0.12);
            },
          });
          return;
        }

        gsap.to(scene5ManWrap, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });

        gsap.to(scene5Man2, {
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          onComplete: function () {
            revealForestLetterHint(0.12);
          },
        });
      },
    });

    gsap.set(scene5ManWrap, {
      opacity: 1,
    });

    if (scene5Man2) {
      gsap.set(scene5Man2, Object.assign({ opacity: 0 }, p2Transform));
    }

    gsap.set(scene5ManWalk, {
      y: 0,
      rotation: 0,
      transformOrigin: "50% 100%",
    });

    gsap.fromTo(scene5ManWrap, p1From, p1To);

    gsap.to(scene5ManWalk, {
      y: "+=1.5",
      rotation: 0.25,
      repeat: -1,
      yoyo: true,
      duration: 0.35,
      ease: "sine.inOut",
    });
  }

  window.startScene5ManAutoWalk = startScene5ManAutoWalk;

  function getWorldTrack() {
    return document.getElementById("world");
  }

  function getHorizontalMaxX() {
    var track = getWorldTrack();
    if (!track) return 0;

    var horizontalScene = document.getElementById("horizontalScene");
    var scene5 = document.getElementById("scene5");
    var sceneOffset = horizontalScene ? horizontalScene.offsetLeft : 0;
    var sceneWidth = 0;

    if (scene5) sceneWidth = Math.max(sceneWidth, scene5.offsetWidth, scene5.scrollWidth);
    if (horizontalScene) sceneWidth = Math.max(sceneWidth, horizontalScene.offsetWidth, horizontalScene.scrollWidth);

    return Math.max(
      0,
      track.scrollWidth - window.innerWidth,
      sceneOffset + sceneWidth - window.innerWidth
    );
  }

  function getHorizontalFallbackX() {
    var horizontalScene = document.getElementById("horizontalScene");
    if (!horizontalScene) return window.innerWidth;
    return Math.max(window.innerWidth, horizontalScene.offsetLeft || 0);
  }

  function getRectInWorld(el) {
    var track = getWorldTrack();
    if (!track || !el) return null;

    var trackRect = track.getBoundingClientRect();
    var rect = el.getBoundingClientRect();

    if (!rect.width && !rect.height) return null;

    return {
      left: rect.left - trackRect.left,
      right: rect.right - trackRect.left,
      top: rect.top - trackRect.top,
      bottom: rect.bottom - trackRect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  function getHorizontalFocusX() {
    var maxX = getHorizontalMaxX();
    if (maxX <= 1) return maxX;

    var focusElements = [
      scene5Man2,
      scene5ManWrap,
      document.querySelector(".scene5__letter-wrap"),
    ].filter(Boolean);

    var bounds = null;
    focusElements.forEach(function (el) {
      var rect = getRectInWorld(el);
      if (!rect) return;

      if (!bounds) {
        bounds = {
          left: rect.left,
          right: rect.right,
        };
        return;
      }

      bounds.left = Math.min(bounds.left, rect.left);
      bounds.right = Math.max(bounds.right, rect.right);
    });

    if (!bounds) return maxX;

    var viewportWidth = window.innerWidth;
    var padding = Math.min(42, Math.max(18, viewportWidth * 0.07));
    var groupWidth = bounds.right - bounds.left;
    var target;

    if (groupWidth + padding * 2 >= viewportWidth) {
      target = bounds.left - padding;
    } else {
      target = bounds.left + groupWidth / 2 - viewportWidth / 2;
    }

    return Math.max(0, Math.min(target, maxX));
  }

  function getHorizontalLimitX() {
    var focusX = getHorizontalFocusX();
    if (focusX > 1) return focusX;
    return getHorizontalMaxX();
  }

  function ensureHorizontalStarted() {
    if (!horizontalStarted) {
      horizontalStarted = true;
      currentX = window.innerWidth;
    }
  }

  function animateWorldToCurrentX(duration, options) {
    var track = getWorldTrack();
    if (!track) return;

    var maxX = getHorizontalLimitX();
    if (maxX <= 1 && currentX > 1) maxX = currentX;
    currentX = Math.max(0, Math.min(currentX, maxX));
    var target = currentX;

    var opts = options || {};
    if (opts.cinematic) {
      gsap.to(track, {
        x: -target,
        duration: 1.6,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: function () {
          gsap.to(track, {
            x: -target + 12,
            duration: 0.25,
            ease: "power1.inOut",
            yoyo: true,
            repeat: 1,
            overwrite: "auto",
            onComplete: function () {
              ScrollTrigger.refresh();
              gsap.set("#horizontalScene", { pointerEvents: "auto" });
              updateHorizontalHintVisibility();
            },
          });
        },
      });
      return;
    }

    var d = typeof duration === "number" ? duration : 0.5;

    gsap.to(track, {
      x: -target,
      duration: d,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: function () {
        ScrollTrigger.refresh();
        gsap.set("#horizontalScene", { pointerEvents: "auto" });
        updateHorizontalHintVisibility();
      },
    });
  }

  function goToHorizontalScene() {
    var track = getWorldTrack();
    if (!track) return;

    horizontalMode = true;
    ensureHorizontalStarted();
    currentX = getHorizontalFocusX();
    if (currentX <= 1) currentX = getHorizontalFallbackX();

    gsap.set("#horizontalScene", { pointerEvents: "none" });
    gsap.killTweensOf(track);
    animateWorldToCurrentX(1.7, { cinematic: true });
  }

  window.goToHorizontalScene = goToHorizontalScene;

  function updateHorizontalHintVisibility() {
    if (!horizontalHint || !horizontalMode) return;

    var maxX = getHorizontalLimitX();
    var atEnd = maxX <= 1 || currentX >= maxX - 2;

    if (!scene5Started && currentX >= maxX - window.innerWidth * 0.2) {
      scene5Started = true;
      startScene5ManAutoWalk();
    }

    if (atEnd) {
      if (horizontalHintHiddenAtEnd) return;
      horizontalHintHiddenAtEnd = true;
      gsap.killTweensOf(horizontalHint);
      gsap.to(horizontalHint, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
        onComplete: function () {
          gsap.set(horizontalHint, {
            visibility: "hidden",
            pointerEvents: "none"
          });
        }
      });
      return;
    }

    if (!horizontalHintHiddenAtEnd) return;
    horizontalHintHiddenAtEnd = false;
    gsap.killTweensOf(horizontalHint);
    gsap.set(horizontalHint, {
      visibility: "visible",
      pointerEvents: "auto"
    });
    gsap.to(horizontalHint, {
      opacity: 1,
      duration: 0.35,
      ease: "power2.out"
    });
  }

  function showHorizontalHint() {
    if (!horizontalHint) return;

    var maxX = getHorizontalLimitX();
    if (maxX <= 1) return;

    horizontalHintHiddenAtEnd = false;
    gsap.killTweensOf(horizontalHint);
    gsap.set(horizontalHint, {
      visibility: "visible",
      pointerEvents: "auto",
      opacity: 0
    });
    gsap.to(horizontalHint, {
      opacity: 1,
      duration: 0.45,
      ease: "power2.out",
      delay: 0.12
    });
  }

  function hideHorizontalHintImmediately() {
    if (!horizontalHint) return;

    horizontalHintHiddenAtEnd = true;
    gsap.killTweensOf(horizontalHint);
    gsap.set(horizontalHint, {
      opacity: 0,
      visibility: "hidden",
      pointerEvents: "none"
    });
  }

  function playCandyVideo() {
    if (candyAnimating || !candy || !candyVideo) return;
    candyAnimating = true;
    if (candyWrap) candyWrap.classList.remove("is-hovering");
    gsap.set(candyTargets, { pointerEvents: "none" });
    gsap.killTweensOf(candyHint);
    gsap.to(candyHint, {
      opacity: 0,
      duration: 0.3,
      onComplete: function () {
        gsap.set(candyHint, {
          opacity: 0,
          display: "none",
          clearProps: "transform"
        });
      }
    });
    var scrollY = window.scrollY || window.pageYOffset || 0;
    lockScroll();
    window.scrollTo(0, scrollY);

    gsap.to(bgLayers, {
      filter: "blur(12px)",
      duration: 0.8,
      ease: "power2.out"
    });

    var stickyRect = document.querySelector(".scene__sticky").getBoundingClientRect();
    var candyRect = candy.getBoundingClientRect();

    // Позиция конфеты относительно sticky-контейнера
    var startX = candyRect.left - stickyRect.left;
    var startY = candyRect.top - stickyRect.top;
    var startW = candyRect.width;
    var startH = candyRect.height;

    // Увеличение в фазе 1: видео должно заполнить существенную часть экрана
    var scaleEnd = Math.min(
      stickyRect.width * 0.4 / startW,
      stickyRect.height * 0.5 / startH
    );
    var finalW = startW * scaleEnd;
    var finalH = startH * scaleEnd;
    var scaleToCenter = finalW / startW;

    // Центр для transform-движения считаем от исходного размера
    var centerX = stickyRect.width / 2 - startW / 2;
    var centerY = stickyRect.height / 2 - startH / 2;
    var deltaX = centerX - startX;
    var deltaY = centerY - startY;
    var zoomScaleTarget = scaleToCenter * 5;

    gsap.set(candy, { opacity: 0 });

    // Начальное состояние видео — на месте конфеты
    gsap.set(candyVideo, {
      left: startX,
      top: startY,
      width: startW,
      height: startH,
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "center center",
      opacity: 1,
      visibility: "visible",
    });

    candyVideo.currentTime = 0;
    candyVideo.play().then(function () {
      var flightDuration = 0.6;
      var coverShown = false;
      var tl = gsap.timeline({
        onComplete: function () {
          function hideVideo() {
            if (coverShown) return;
            coverShown = true;
            candyVideo.removeEventListener("ended", hideVideo);
            showCover();
            gsap.to(candyVideo, {
              opacity: 0,
              visibility: "hidden",
              duration: 0.35,
              ease: "power1.in",
              onComplete: function () {
                candyAnimating = false;
                candyVideo.pause();
                candyVideo.currentTime = 0;
              },
            });
          }
          candyVideo.addEventListener("ended", hideVideo);
          setTimeout(function () {
            candyVideo.removeEventListener("ended", hideVideo);
            hideVideo();
          }, (candyVideo.duration - flightDuration) * 1000 + 500);
        },
      });

      // Фаза 1: появление + полёт в центр (оригинальная логика)
      tl.to(candyVideo, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.inOut",
      }, 0);

      tl.to(candyVideo, {
        x: deltaX,
        y: deltaY,
        scale: zoomScaleTarget,
        duration: flightDuration,
        ease: "power2.inOut",
      }, 0);

    }).catch(function () {
      candyAnimating = false;
      gsap.to(bgLayers, { filter: "blur(0px)", duration: 0.4 });
      unlockScroll();
      gsap.set(candy, { opacity: 1 });
      gsap.set(candyTargets, { pointerEvents: "auto" });
    });
  }

  if (candy) {
    candy.addEventListener("click", playCandyVideo);
  }
  if (candyWrap) {
    candyWrap.addEventListener("click", playCandyVideo);
  }

  function isCandyReadyForPointer() {
    if (!candy || candyAnimating || horizontalMode) return false;

    var style = window.getComputedStyle(candy);
    if (style.visibility === "hidden" || style.display === "none") return false;

    return Number(style.opacity) > 0.35;
  }

  function isPointInsideCandy(clientX, clientY) {
    if (!isCandyReadyForPointer()) return false;

    var rect = candy.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  document.addEventListener("pointermove", function (e) {
    if (!candyWrap) return;
    candyWrap.classList.toggle("is-hovering", isPointInsideCandy(e.clientX, e.clientY));
  }, { passive: true });

  document.addEventListener("pointerleave", function () {
    if (candyWrap) candyWrap.classList.remove("is-hovering");
  }, { passive: true });

  document.addEventListener("click", function (e) {
    if (!isPointInsideCandy(e.clientX, e.clientY)) return;

    e.preventDefault();
    e.stopPropagation();
    playCandyVideo();
  }, true);

  function closeCandyCover(options) {
    if (!coverWrap) return;

    var opts = options || {};
    gsap.killTweensOf(["#coverCandyWrap", "#freeCandy"]);
    hideHorizontalHintImmediately();

    gsap.to("#coverCandyWrap", {
      opacity: 0,
      duration: 0.4,
      onComplete: function () {
        gsap.set("#coverCandyWrap", {
          visibility: "hidden",
          pointerEvents: "none",
        });
        if (freeCandyEl) gsap.set(freeCandyEl, { opacity: 0, visibility: "hidden", y: 0, scale: 1 });
        gsap.set(candy, { opacity: 1 });
        gsap.set(candyTargets, { pointerEvents: "auto" });
        unlockScroll();
        ScrollTrigger.refresh();
        horizontalMode = true;
        gsap.set("#horizontalScene", { pointerEvents: "none" });
        if (opts.advance) {
          goToHorizontalScene();
        }
      }
    });

    gsap.to(bgLayers, {
      filter: "blur(0px)",
      duration: 0.8
    });
  }

  if (candyCoverCloseBtn) {
    candyCoverCloseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeCandyCover();
    });
  }

  window.addEventListener("wheel", function (e) {
    if (!horizontalMode) return;

    e.preventDefault();

    var track = getWorldTrack();
    if (!track) return;

    ensureHorizontalStarted();
    currentX += e.deltaY;
    animateWorldToCurrentX();
  }, { passive: false });

  if (horizontalHint) {
    var lastHorizontalHintAt = 0;
    var handleHorizontalHint = function (e) {
      e.preventDefault();
      e.stopPropagation();

      var now = Date.now();
      if (now - lastHorizontalHintAt < 350) return;
      lastHorizontalHintAt = now;

      hideHorizontalHintImmediately();
      closeCandyCover({ advance: true });
    };

    horizontalHint.addEventListener("click", handleHorizontalHint);
    horizontalHint.addEventListener("pointerup", handleHorizontalHint);

    document.addEventListener("click", function (e) {
      if (!e.target || !e.target.closest || !e.target.closest("#horizontalHint")) return;
      handleHorizontalHint(e);
    }, true);

    document.addEventListener("pointerup", function (e) {
      if (!e.target || !e.target.closest || !e.target.closest("#horizontalHint")) return;
      handleHorizontalHint(e);
    }, true);
  }

  /* ---------- Инициализация ---------- */
  function init() {
    ScrollTrigger.refresh();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  }
  window.addEventListener("load", init);
  window.addEventListener("resize", positionFreeCandy);

  var imgs = document.querySelectorAll(".scene__img, .scene__lady-img");
  var remaining = 0;
  imgs.forEach(function (img) {
    if (!img.complete || img.naturalWidth === 0) {
      remaining++;
      img.addEventListener("load", function onLoad() {
        img.removeEventListener("load", onLoad);
        remaining--;
        if (remaining <= 0) init();
      });
    }
  });

  init();
})();
