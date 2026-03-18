/*
 * Reddit Feed Blocker – content script
 *
 * Replaces feed/search pages with a snarky message.
 * Individual post pages (/comments/) are left alone.
 */

const messages = [
  "You weren't really going to scroll for 45 minutes, were you?",
  "Nothing here. Go build something.",
  "The feed is gone. Your free time isn't.",
  "Nice try. Go outside.",
  "This page used to have content. You're welcome.",
  "You've been liberated from the algorithm.",
  "Touch grass. This is not a suggestion.",
  "The doomscroll ends here.",
  "Imagine what you could do with the next hour instead.",
  "Reddit's loss is your productivity's gain.",
];

function randomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

function isPostPage(url) {
  const path = new URL(url).pathname;
  return /\/comments\//.test(path);
}

let overlay = null;
let savedBody = null;

function showOverlay() {
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.id = "rfb-overlay";
  overlay.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100vw;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2147483647;
      background: #0e0e0e;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 2rem;
    ">
      <div style="font-size: 3rem; margin-bottom: 1.5rem;">&#128683;</div>
      <div style="font-size: 1.5rem; max-width: 500px; line-height: 1.6;">${randomMessage()}</div>
    </div>
  `;

  document.documentElement.appendChild(overlay);
  document.body.style.overflow = "hidden";
}

function removeOverlay() {
  if (overlay) {
    overlay.remove();
    overlay = null;
    document.body.style.overflow = "";
  }
}

function update() {
  if (isPostPage(location.href)) {
    document.documentElement.classList.add("rfb-post-page");
    removeOverlay();
  } else {
    document.documentElement.classList.remove("rfb-post-page");
    showOverlay();
  }
}

// Wait for body to exist, then run
if (document.body) {
  update();
} else {
  document.addEventListener("DOMContentLoaded", update);
}

// Re-check on SPA navigations
const observer = new MutationObserver(() => {
  update();
});
observer.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener("popstate", update);

const _pushState = history.pushState;
history.pushState = function (...args) {
  _pushState.apply(this, args);
  update();
};

const _replaceState = history.replaceState;
history.replaceState = function (...args) {
  _replaceState.apply(this, args);
  update();
};
