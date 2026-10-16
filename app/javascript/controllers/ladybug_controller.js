import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["bug", "thread"]

  connect() {
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)")
    this.x = 0; this.y = 22; this.vx = 0; this.vy = 0
    this.dragging = false
    this.paint()
    this.onMotionChange = () => {
      if (this.reduced.matches) { cancelAnimationFrame(this.frame); this.x = 0; this.y = 22; this.paint() }
    }
    this.reduced.addEventListener("change", this.onMotionChange)
  }

  disconnect() {
    cancelAnimationFrame(this.frame)
    this.reduced.removeEventListener("change", this.onMotionChange)
  }

  grab(event) {
    if (this.reduced.matches || (event.pointerType === "mouse" && event.button !== 0)) return
    event.preventDefault()
    cancelAnimationFrame(this.frame)
    this.dragging = true
    this.origin = { x: event.clientX - this.x, y: event.clientY - this.y }
    this.bugTarget.setPointerCapture(event.pointerId)
    this.bugTarget.classList.add("held")
  }

  move(event) {
    if (!this.dragging) return
    const x = Math.max(-70, Math.min(70, event.clientX - this.origin.x))
    const y = Math.max(-5, Math.min(100, event.clientY - this.origin.y))
    this.vx = (x - this.x) * 12; this.vy = (y - this.y) * 12
    this.x = x; this.y = y
    this.paint()
  }

  release() {
    if (!this.dragging) return
    this.dragging = false
    this.bugTarget.classList.remove("held")
    this.animate()
  }

  nudge(event) {
    if (this.reduced.matches || this.dragging) return
    // Keyboard activation also makes the bug bounce.
    if (event.detail === 0) { this.vx = 180; this.vy = -100; this.animate() }
  }

  animate() {
    cancelAnimationFrame(this.frame)
    let previous
    const tick = time => {
      if (this.dragging || this.reduced.matches) return
      let remaining = Math.min((time - (previous ?? time)) / 1000, 0.05)
      previous = time
      while (remaining > 0) {
        const dt = Math.min(1 / 120, remaining)
        this.vx += -162 * this.x * dt
        this.vy += (-162 * (this.y - 10.889) + 1800) * dt
        this.vx *= Math.exp(-7.669 * dt); this.vy *= Math.exp(-7.669 * dt)
        this.x += this.vx * dt; this.y += this.vy * dt
        remaining -= dt
      }
      this.paint()
      if (Math.abs(this.x) + Math.abs(this.y - 22) + Math.abs(this.vx) + Math.abs(this.vy) > 0.2) this.frame = requestAnimationFrame(tick)
      else { this.x = 0; this.y = 22; this.paint() }
    }
    this.frame = requestAnimationFrame(tick)
  }

  paint() {
    this.bugTarget.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.x * 0.25}deg)`
    this.threadTarget.setAttribute("d", `M28 0 Q${28 + this.x * 0.3} ${12 + this.y * 0.4} ${28 + this.x} ${this.y + 22}`)
  }
}
