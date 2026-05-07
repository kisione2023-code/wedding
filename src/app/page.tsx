"use client"

import { useCallback, useEffect, useRef } from "react"
import gsap from "gsap"

export default function Home() {
  const bgRef        = useRef<HTMLDivElement>(null)
  const candyButtonRef = useRef<HTMLButtonElement>(null)
  const candyImgRef  = useRef<HTMLImageElement>(null)
  const videoRef     = useRef<HTMLVideoElement>(null)
  const coverWrapRef = useRef<HTMLDivElement>(null)
  const freeCandyRef = useRef<HTMLImageElement>(null)
  const transitionedRef = useRef(false)
  const blurTweenRef = useRef<gsap.core.Tween | null>(null)
  const floatTweenRef = useRef<gsap.core.Tween | null>(null)
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const endedHandlerRef = useRef<(() => void) | null>(null)

  const clearFallbackTimeout = useCallback(() => {
    if (!fallbackTimeoutRef.current) return
    clearTimeout(fallbackTimeoutRef.current)
    fallbackTimeoutRef.current = null
  }, [])

  const showCover = useCallback(() => {
    const bg        = bgRef.current
    const candyImg  = candyImgRef.current
    const video     = videoRef.current
    const coverWrap = coverWrapRef.current
    const freeCandy = freeCandyRef.current

    if (!bg || !candyImg || !video || !coverWrap || !freeCandy) return

    if (transitionedRef.current) return
    transitionedRef.current = true

    clearFallbackTimeout()
    blurTweenRef.current?.kill()
    blurTweenRef.current = null

    gsap.timeline()
      // Cover ready immediately at opacity 0: true crossfade, no dark gap.
      .set(coverWrap, { visibility: "visible", opacity: 0 }, 0)
      .to(video,      { opacity: 0, duration: 0.8, ease: "power2.in"  }, 0)
      .set(video,     { visibility: "hidden", pointerEvents: "none" }, 0.8)
      .to(bg,         { filter: "blur(12px)", duration: 0.7, ease: "power2.out" }, 0)
      .to(coverWrap,  { opacity: 1, duration: 0.9, ease: "power2.out" }, 0)
      .set(freeCandy, { visibility: "visible", opacity: 0, scale: 0.88 }, 0.65)
      .to(freeCandy,  { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out"  }, 0.7)
      .add(() => {
        floatTweenRef.current = gsap.to(freeCandy, {
          y: "-=5",
          duration: 1.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })
      }, 1.35)
  }, [clearFallbackTimeout])

  const playCandyVideo = useCallback(() => {
    const bg        = bgRef.current
    const candyButton = candyButtonRef.current
    const candyImg  = candyImgRef.current
    const video     = videoRef.current

    if (!bg || !candyButton || !candyImg || !video || transitionedRef.current) return

    candyButton.disabled = true
    candyButton.style.pointerEvents = "none"

    // Fade out candy image.
    gsap.to(candyImg, { opacity: 0, scale: 0.9, duration: 0.2, ease: "power2.in",
      onComplete: () => {
        candyImg.style.visibility = "hidden"
        candyButton.style.visibility = "hidden"
      },
    })

    // Start background blur (progresses while video plays).
    blurTweenRef.current = gsap.to(bg, {
      filter: "blur(12px)",
      duration: 5,
      ease: "power2.inOut",
    })

    // Make video ready but keep it out of hit-testing.
    gsap.set(video, { visibility: "visible", opacity: 0, pointerEvents: "none" })

    video.currentTime = 0
    video.removeEventListener("ended", showCover)
    endedHandlerRef.current = showCover

    video.play()
      .then(() => {
        gsap.to(video, { opacity: 1, duration: 0.2, ease: "power2.out" })

        video.addEventListener("ended", showCover, { once: true })

        const dur = isFinite(video.duration) && video.duration > 0 ? video.duration : 4
        fallbackTimeoutRef.current = setTimeout(showCover, (dur + 2) * 1000)
      })
      .catch(() => {
        gsap.set(video, { visibility: "hidden", pointerEvents: "none" })
        showCover()
      })
  }, [showCover])

  useEffect(() => {
    const bg        = bgRef.current
    const candyImg  = candyImgRef.current
    const video     = videoRef.current
    const coverWrap = coverWrapRef.current
    const freeCandy = freeCandyRef.current

    if (!bg || !candyImg || !video || !coverWrap || !freeCandy) return

    gsap.set(video, { pointerEvents: "none" })
    gsap.set(coverWrap, { pointerEvents: "none" })
    gsap.set(freeCandy, { pointerEvents: "none" })

    return () => {
      clearFallbackTimeout()
      if (endedHandlerRef.current) {
        video.removeEventListener("ended", endedHandlerRef.current)
      }
      blurTweenRef.current?.kill()
      floatTweenRef.current?.kill()
      gsap.killTweensOf([bg, candyImg, video, coverWrap, freeCandy])
    }
  }, [clearFallbackTimeout])

  return (
    <main className="cinematic-scene">

      {/* Layer 1 — background forest scene */}
      <div ref={bgRef} id="background">
        <img
          src="/images/scene1.webp"
          alt=""
          width={2452}
          height={3200}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* Layer 2 — candy image, shown on load, click to play video */}
      <button
        ref={candyButtonRef}
        id="candyButton"
        type="button"
        aria-label="Открыть приглашение"
        onClick={playCandyVideo}
      >
        <img
          ref={candyImgRef}
          id="candyImg"
          src="/images/candy.png"
          alt=""
          width={104}
          height={81}
        />
      </button>

      {/* Layer 3 — candy video, hidden until clicked */}
      <video
        ref={videoRef}
        id="candyVideo"
        src="/images/candy.webm"
        muted
        playsInline
        preload="auto"
      />

      {/* Layer 4 — cover wrapper, crossfades in after video */}
      <div ref={coverWrapRef} id="coverCandyWrap">
        <div className="paper-layout paper-layout--cover">
          <img
            id="coverCandy"
            className="paper-bg"
            src="/images/cover_candy.webp"
            alt=""
            decoding="async"
          />
          <div className="paper-content paper-content--cover">
            <div className="candy-cover__head">
              <p className="candy-title candy-cover__date-main">17 мая</p>
              <p className="candy-title candy-cover__forest">В ТАЙНОМ ЛЕСУ</p>
              <p className="candy-text candy-cover__intro">
                начнётся история, в которой вы тоже замешаны
              </p>
            </div>
            <div className="candy-cover__middle">
              <div className="candy-cover__middle-inner">
                <div className="candy-cover__middle-main">
                  <p className="candy-text">Будет немного магии,</p>
                  <p className="candy-text">много тепла и приятных людей</p>
                  <p className="candy-text candy-cover__strike">и не только</p>
                </div>
              </div>
            </div>
            <p className="candy-title candy-cover__closing">Мы очень вас ждём!</p>
          </div>
        </div>
      </div>

      {/* Layer 5 — free candy, floats above the cover */}
      <img
        ref={freeCandyRef}
        id="freeCandy"
        src="/images/free_candy.webp"
        alt=""
      />

    </main>
  )
}
