import { animate, inView } from "motion";

const EASE = [0.22, 1, 0.36, 1];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function show(el: HTMLElement, delay: number) {
  if (prefersReducedMotion()) {
    el.style.opacity = "1";
    el.style.transform = "none";
    return;
  }
  animate(
    el,
    { opacity: [0, 1], y: [24, 0] },
    { duration: 0.6, delay, easing: EASE },
  );
}

/** Animate matching elements in immediately, staggered in DOM order. Use for above-the-fold content. */
export function revealNow(selector: string, stagger = 0.1) {
  document
    .querySelectorAll<HTMLElement>(selector)
    .forEach((el, i) => show(el, i * stagger));
}

/** Animate each matching element in the first time it scrolls into view. */
export function revealOnScroll(selector: string, stagger = 0.08) {
  document.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
    inView(el, () => show(el, i * stagger), { margin: "0px 0px -10% 0px" });
  });
}
