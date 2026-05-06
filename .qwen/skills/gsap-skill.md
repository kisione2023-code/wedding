# GSAP Animation Skill (Scroll Storytelling)

## 🎯 Purpose

This skill ensures correct usage of GSAP and ScrollTrigger for immersive scroll-based storytelling websites.

It enforces:

* smooth animations
* correct lifecycle handling
* no memory leaks
* proper scroll-based timelines

---

## ⚠️ Core Rules (STRICT)

1. ALWAYS use `gsap.context()` in React components
2. ALWAYS clean up animations using `ctx.revert()`
3. NEVER create GSAP animations outside `useEffect` / `useLayoutEffect`
4. NEVER use GSAP without registering ScrollTrigger when scroll is involved
5. ALWAYS scope selectors to component refs

---

## ✅ Correct React Integration

### Pattern (MANDATORY)

```tsx
const containerRef = useRef(null)

useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    // animations here
  }, containerRef)

  return () => ctx.revert()
}, [])
```

---

## 🎬 ScrollTrigger Rules

### REQUIRED setup

```ts
gsap.registerPlugin(ScrollTrigger)
```

---

### Basic ScrollTrigger

```ts
gsap.to(element, {
  y: 100,
  scrollTrigger: {
    trigger: element,
    start: "top bottom",
    end: "bottom top",
    scrub: true
  }
})
```

---

## 🎞 Timeline Pattern (PREFERRED)

Use timeline instead of multiple gsap.to calls:

```ts
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: container,
    start: "top top",
    end: "+=1000",
    scrub: true,
    pin: true
  }
})

tl.to(layer1, { y: 50 })
  .to(layer2, { y: 100 }, 0)
```

---

## 🌌 Parallax Rules

Layer speeds must differ:

* background → slow (y: 20–50)
* midground → medium (y: 80–120)
* foreground → fast (y: 150–300)

NEVER use same values for all layers.

---

## 🎥 Camera Simulation

Use combination of:

* translate (x, y)
* scale
* slight rotation (optional)

Example:

```ts
tl.to(container, {
  scale: 1.1,
  y: -200
})
```

---

## 🔄 Seamless Transitions

DO:

* overlap animations in timeline
* use same ScrollTrigger for related elements

DO NOT:

* create separate triggers for each small element
* create hard section jumps

---

## 🚫 Common Mistakes (FORBIDDEN)

❌ Missing cleanup → causes memory leaks
❌ Using gsap without refs
❌ Animating with top/left instead of transform
❌ Too many ScrollTriggers
❌ No scrub → breaks immersion

---

## ⚡ Performance Rules

* Use `transform` only (translate, scale)
* Avoid layout-triggering properties
* Limit number of animated elements
* Use `will-change: transform`

---

## 📱 Mobile Rules

* Reduce number of layers
* Disable heavy animations if needed
* Avoid pinning large sections

---

## 🧠 Debugging Checklist

If animation is broken:

1. Is ScrollTrigger registered?
2. Is element inside ref?
3. Is cleanup implemented?
4. Are start/end values correct?
5. Is scrub enabled?

---

## 🧩 Architecture Rules

* Each scene = separate component
* Each scene = one main timeline
* Layers = separate elements inside scene

---

## ✅ Output Expectations

When implementing animation:

1. Explain what animation does
2. Show code
3. Confirm cleanup is implemented
4. Confirm no memory leaks

---

## 🚀 Behavior Instruction

If unsure:

* use web-search MCP to find GSAP examples
* adapt them to React + ScrollTrigger correctly

NEVER guess GSAP API.
