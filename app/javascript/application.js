// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

// ─── Keyboard shortcut: Space / Enter → もう一回バグる ────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" && e.code !== "Enter") return
  if (["BUTTON", "A", "INPUT", "TEXTAREA"].includes(e.target.tagName)) return
  e.preventDefault()
  document.querySelector(".bug-btn")?.click()
})

// ─── Sound Engine (Web Audio API) ────────────────────────────────────────────
let _ctx = null
const sfx = {
  ctx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
    return _ctx
  },

  // ピッ：ターミナル電子音
  beep() {
    try {
      const c = this.ctx(), osc = c.createOscillator(), g = c.createGain()
      osc.connect(g); g.connect(c.destination)
      osc.type = "square"; osc.frequency.value = 880
      g.gain.setValueAtTime(0.07, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07)
      osc.start(); osc.stop(c.currentTime + 0.07)
    } catch {}
  },

  // ポン：結果表示
  pop() {
    try {
      const c = this.ctx(), osc = c.createOscillator(), g = c.createGain()
      osc.connect(g); g.connect(c.destination)
      osc.type = "sine"
      osc.frequency.setValueAtTime(520, c.currentTime)
      osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.1)
      g.gain.setValueAtTime(0.07, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1)
      osc.start(); osc.stop(c.currentTime + 0.1)
    } catch {}
  },

  // キラーン：レアバグ (C5→E5→G5→C6 アルペジオ)
  rare() {
    try {
      const c = this.ctx()
      ;[523, 659, 784, 1047].forEach((freq, i) => {
        const osc = c.createOscillator(), g = c.createGain()
        osc.connect(g); g.connect(c.destination)
        osc.type = "sine"; osc.frequency.value = freq
        const t = c.currentTime + i * 0.08
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.09, t + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
        osc.start(t); osc.stop(t + 0.22)
      })
    } catch {}
  },

  // カシャ：シェアボタン（ノイズバースト）
  shutter() {
    try {
      const c = this.ctx()
      const len = Math.floor(c.sampleRate * 0.055)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.5
      const src = c.createBufferSource(), g = c.createGain()
      src.buffer = buf; src.connect(g); g.connect(c.destination)
      g.gain.value = 0.07; src.start()
    } catch {}
  }
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────
const LOADING_FRAMES = [". . .", "Loading.", "Loading..", "Loading..."]

function showLoading() {
  const frame = document.querySelector("turbo-frame#bug")
  if (!frame || document.getElementById("bug-loading")) return
  const el = document.createElement("div")
  el.id = "bug-loading"
  el.className = "bug-loading-overlay"
  el.innerHTML = `<span id="bug-loading-text">. . .</span>`
  frame.appendChild(el)
  let i = 0
  el._iv = setInterval(() => {
    const t = document.getElementById("bug-loading-text")
    if (t) t.textContent = LOADING_FRAMES[++i % LOADING_FRAMES.length]
  }, 150)
  el._to = setTimeout(hideLoading, 5000)
}

function hideLoading() {
  const el = document.getElementById("bug-loading")
  if (!el) return
  clearInterval(el._iv)
  clearTimeout(el._to)
  el.remove()
}

// ─── Event Wiring ─────────────────────────────────────────────────────────────
document.addEventListener("click", (e) => {
  if (e.target.closest(".bug-btn")) {
    sfx.beep()
    showLoading()
  }
  if (e.target.closest(".share-btn")) {
    sfx.shutter()
  }
})

document.addEventListener("turbo:frame-load", (e) => {
  if (e.target.id !== "bug") return
  hideLoading()
  const isRare = !!e.target.querySelector(".error-box.rare")
  setTimeout(() => isRare ? sfx.rare() : sfx.pop(), 60)
})

// ─── Console Easter Egg ───────────────────────────────────────────────────────
document.addEventListener("turbo:load", () => {
  console.log(
    "%c 🐞 Bug Generator %c built by mize ",
    "background:#ef4444;color:#fff;font-size:13px;font-weight:bold;padding:5px 10px;border-radius:6px 0 0 6px;",
    "background:#0f172a;color:#f87171;font-size:13px;font-weight:bold;padding:5px 10px;border-radius:0 6px 6px 0;"
  )
  console.log("%c ✦ github.com/mize1978/bug_generator", "color:#ef4444;font-size:11px;padding-left:2px;")
})
