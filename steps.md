# Development Plan: Immersive Scroll Story Website

## ⚠️ General Rules (VERY IMPORTANT)

You MUST follow these rules at every step:

1. Work ONLY on the current step
2. Do NOT implement future steps
3. After each step:
   - run the project
   - check terminal for errors
   - fix all errors before moving on
4. Ensure code compiles and works
5. Keep code clean and minimal
6. If something fails — debug before continuing

---

## 🧩 STEP 0 — Project Initialization

### Goal
Create base Next.js project

### Tasks
- Create Next.js app (App Router)
- Enable TypeScript
- Install Tailwind CSS

### After completion
- Run dev server
- Open browser
- Ensure default page works

---

## 🧩 STEP 1 — Install Core Dependencies

### Goal
Prepare animation system

### Tasks
Install:
- gsap
- @types/gsap

Optional (prepare but don't use yet):
- lenis

### After completion
- Run project
- Ensure no install errors
- Import gsap in a test file

---

## 🧩 STEP 2 — Basic Layout Setup

### Goal
Create clean base layout

### Tasks
- Create `/app/page.tsx`
- Remove default styles
- Add full-screen container

### Requirements
- height: 100vh
- overflow: hidden

### After completion
- Page renders correctly
- No scroll yet

---

## 🧩 STEP 3 — Scene System

### Goal
Create reusable scene wrapper

### Tasks
Create component:
`SceneWrapper.tsx`

Props:
- children
- height (default 200vh)

Behavior:
- relative container
- large scroll area

### After completion
- Add one SceneWrapper to page
- Verify it creates scroll

---

## 🧩 STEP 4 — Parallax Layer System

### Goal
Create layered structure

### Tasks
Create component:
`ParallaxLayer.tsx`

Props:
- speed (number)
- children

Behavior:
- transform based on scroll
- different speeds per layer

### After completion
- Add 3 layers:
  - background
  - midground
  - foreground
- Use placeholder colors/divs
- Confirm visual difference

---

## 🧩 STEP 5 — GSAP ScrollTrigger Setup

### Goal
Connect scroll to animation

### Tasks
- Register ScrollTrigger
- Create simple animation:
  - move layer on scroll

### Example behavior
- background moves slower
- foreground faster

### After completion
- Scroll affects layers
- No console errors

---

## 🧩 STEP 6 — Timeline-Based Animation

### Goal
Switch from simple animation to timeline

### Tasks
- Create GSAP timeline
- Attach ScrollTrigger
- Use `scrub: true`

### After completion
- Smooth continuous animation
- No jumps

---

## 🧩 STEP 7 — First Scene (Sky → Ground)

### Goal
Simulate camera moving down

### Tasks
- Create sky layer
- Create ground layer
- Animate vertical movement

### After completion
- Feels like camera goes down
- No hard cuts

---

## 🧩 STEP 8 — Depth Enhancement

### Goal
Add realistic parallax

### Tasks
- Add more layers (4–5 total)
- Adjust speeds

### After completion
- Clear depth effect
- Layers move differently

---

## 🧩 STEP 9 — Second Scene (Forest Path)

### Goal
Create forward movement illusion

### Tasks
- Add trees (left/right layers)
- Animate slight horizontal + scale

### After completion
- Feels like moving forward
- Smooth transition from previous scene

---

## 🧩 STEP 10 — Scene Transitions

### Goal
Remove "section feeling"

### Tasks
- Overlap scenes
- Use fade + translate
- Avoid hard breaks

### After completion
- Scenes blend into each other

---

## 🧩 STEP 11 — Character Introduction

### Goal
Add main character

### Tasks
- Add image (girl)
- Position in scene
- Animate slight appearance

### After completion
- Character appears naturally

---

## 🧩 STEP 12 — Interactive Object

### Goal
Add clickable/scroll-triggered object

### Tasks
- Add object (candy)
- Animate opening

### After completion
- Interaction triggers animation

---

## 🧩 STEP 13 — Story Card

### Goal
Show content overlay

### Tasks
- Create StoryCard component
- Show on trigger

### After completion
- Card appears smoothly
- Does not break scroll

---

## 🧩 STEP 14 — Camera Feel Improvements

### Goal
Make motion cinematic

### Tasks
- Add:
  - scale animation
  - slight easing
  - subtle rotation (optional)

### After completion
- Movement feels like camera

---

## 🧩 STEP 15 — Performance Optimization

### Goal
Ensure smooth experience

### Tasks
- Use `will-change`
- Optimize images
- Reduce DOM nodes

### After completion
- No lag
- Stable FPS

---

## 🧩 STEP 16 — Mobile Adaptation

### Goal
Make it usable on mobile

### Tasks
- Disable heavy animations OR simplify
- Reduce layers

### After completion
- Works on mobile without lag

---

## 🧩 STEP 17 — Final Polish

### Goal
Refine experience

### Tasks
- Fix timing
- Adjust speeds
- Improve transitions

### After completion
- Seamless storytelling feel achieved

---

## ✅ FINAL CHECKLIST

Before finishing:

- No console errors
- Smooth scroll
- No jumps
- Scenes feel connected
- Depth is visible
- Interaction works

---

## 🧠 IMPORTANT

If ANY step fails:
- STOP
- DEBUG
- FIX
- ONLY THEN continue

DO NOT skip broken steps