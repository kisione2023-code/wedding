# Project: Immersive Scroll Story Website

## 🎯 Goal
Create a seamless, immersive storytelling website with:
- parallax scrolling
- multi-layered scenes
- smooth transitions between sections
- cinematic camera-like movement
- interactive elements (hover / scroll-triggered)

The experience should feel like a continuous animated scene, not separate blocks.

---

## 🧱 Tech Stack

### Core
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS

### Animation & Scroll
- GSAP (GreenSock)
- GSAP ScrollTrigger plugin

### 3D / Advanced visuals (optional but preferred)
- Three.js or React Three Fiber (for depth and camera movement)

### Assets & Rendering
- Use SVG + PNG layers
- Use WebP for performance
- Use Lottie (for micro-animations if needed)

---

## 🎥 Key Concepts

### 1. Scroll = Timeline
Scrolling should control animation timeline.

Use GSAP ScrollTrigger:
- scrub: true
- pin sections
- timeline-based animation

---

### 2. Layered Parallax System

Each scene must have layers:

- background (slowest movement)
- midground
- foreground (fastest movement)
- UI overlay (text, cards, interactions)

Example:
```ts
gsap.to(background, { y: 50, scrollTrigger: {...} })
gsap.to(midground, { y: 100, scrollTrigger: {...} })
gsap.to(foreground, { y: 200, scrollTrigger: {...} })