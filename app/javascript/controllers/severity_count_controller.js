import { Controller } from "@hotwired/stimulus"

// 深刻度の数字を 0 から数え上げる。バーの伸び（CSS）と同じ尺・同じ緩急。
const DURATION = 700

export default class extends Controller {
  static targets = ["value"]

  connect() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const el = this.valueTarget
    const to = Number(el.dataset.to) || 0
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / DURATION, 1)
      el.textContent = Math.round(to * (1 - (1 - t) ** 3))
      if (t < 1) this.frame = requestAnimationFrame(tick)
    }
    el.textContent = "0"
    this.frame = requestAnimationFrame(tick)
  }

  disconnect() {
    cancelAnimationFrame(this.frame)
    this.valueTarget.textContent = this.valueTarget.dataset.to
  }
}
