import { Controller } from "@hotwired/stimulus"

// Ported from MizeLy HERO ladybug.tsx: same fixed-step radial spring,
// pointer avoidance, random fidget, legs, antennae, pupils, and thread.
// Only the title anchor and viewport edge bounds adapt to this page.
const ATTACH_VB = 26
/* 本家のフレーム単位定数を連続時間へ変換（基準 60fps, h = 1/60）
     v += 0.045*(T-x) → ω² = 0.045/h² = 162
     v += 0.5         → G  = 0.5/h²   = 1800 px/s²
     v *= 0.88        → c  = -ln(0.88)/h = 7.669 /s */
const W2 = 162
const G = 1800
const C = 7.669
const STEP = 1 / 120
const MAX_ACC = 0.25
/** バネと重力が釣り合う位置は L より 11.1px 下。 */
const STRETCH = G / W2

/** 虫の大きさ。HERO の主役は見出しなので、notice の 71px より小さくしてある。 */
const SIZE_DESKTOP = 46
const SIZE_MOBILE = 36

/** 吊り下げの長さ。ワードマークの高さに対する比。 */
const HANG_RATIO = 0.42
/** アンカーから離れられる上限（px）。これ以上は引っ張れない。 */
const MAX_REACH = 150

const LEGS = [
    { p: [15, 30, 9.5, 28, 6.5, 24.5], side: -1, arm: true },
    { p: [13.5, 38, 7.5, 38.5, 4.5, 36.2], side: -1, arm: false },
    { p: [15.5, 46, 10, 48.5, 7.5, 52.2], side: -1, arm: false },
    { p: [49, 30, 54.5, 28, 57.5, 24.5], side: 1, arm: true },
    { p: [50.5, 38, 56.5, 38.5, 59.5, 36.2], side: 1, arm: false },
    { p: [48.5, 46, 54, 48.5, 56.5, 52.2], side: 1, arm: false }
]


export default class extends Controller {
  static targets = ["bug", "thread"]

  connect() {
    this.motion = matchMedia("(prefers-reduced-motion: reduce)")
    this.restart = () => { this.cleanup?.(); this.start() }
    this.motion.addEventListener("change", this.restart)
    this.start()
  }

  disconnect() {
    this.cleanup?.()
    this.motion.removeEventListener("change", this.restart)
  }

  start() {
    const reduce = this.motion.matches
    const layer = this.element
    const wrap = this.bugTarget
    const svg = wrap.querySelector("svg")
    const thread = this.threadTarget
    const legsRef = { current: Array.from(svg.querySelectorAll("[data-bug-part='leg']")) }
    const antLRef = { current: svg.querySelector("[data-bug-part='antL']") }
    const antRRef = { current: svg.querySelector("[data-bug-part='antR']") }
    const antLtRef = { current: svg.querySelector("[data-bug-part='antLt']") }
    const antRtRef = { current: svg.querySelector("[data-bug-part='antRt']") }
    const pupLRef = { current: svg.querySelector("[data-bug-part='pupL']") }
    const pupRRef = { current: svg.querySelector("[data-bug-part='pupR']") }
    const hiLRef = { current: svg.querySelector("[data-bug-part='hiL']") }
    const hiRRef = { current: svg.querySelector("[data-bug-part='hiR']") }
        const canHover = window.matchMedia('(hover: hover)').matches

        const s = {
            ax: 0,
            ay: 0,
            L: 0,
            size: SIZE_DESKTOP,
            attachY: 0,
            bx: 0,
            by: 0,
            vx: 0,
            vy: 0,
            dragging: false,
            offX: 0,
            offY: 0,
            px: -1e4,
            py: -1e4,
            hasPointer: false,
            legT: 0,
            antT: 0,
            excite: 0,
            jitter: 0,
            nextJitter: 4 + Math.random() * 5
        }

        /**
         * 吊り位置は MIZELY のワードマークから測る。
         * h1 直下の inline-block が字の実寸の箱（h1 自体は行いっぱいに広がる）。
         */
        const measure = () => {
            s.size = window.innerWidth < 640 ? SIZE_MOBILE : SIZE_DESKTOP
            s.attachY = (ATTACH_VB / 64) * s.size
            svg.setAttribute('width', String(s.size))
            svg.setAttribute('height', String(s.size))
            svg.style.width = `${s.size}px`
            svg.style.height = `${s.size}px`
            wrap.style.width = `${s.size}px`
            wrap.style.height = `${s.size}px`

            const word = this.element.closest(".title-row").querySelector("h1")
            const box = layer.getBoundingClientRect()
            if (!word || box.width === 0) return
            const r = word.getBoundingClientRect()

            // 字の右端の外側へ逃がす。重ねると可読性を削る。
            s.ax = r.right - box.left + s.size * 0.5
            s.ay = r.top - box.top + s.size * 0.18
            s.L = Math.max(s.size * 0.9, r.height * HANG_RATIO) - STRETCH
        }

        /** アンカーからの距離に上限をかける。掴んでいる間も効かせる。 */
        const clampReach = () => {
            const box = layer.getBoundingClientRect()
            s.bx = Math.max(s.size / 2 - box.left + 4, Math.min(window.innerWidth - box.left - s.size / 2 - 4, s.bx))
            const dx = s.bx - s.ax
            const dy = s.by - s.ay
            const d = Math.hypot(dx, dy)
            if (d > MAX_REACH) {
                s.bx = s.ax + (dx / d) * MAX_REACH
                s.by = s.ay + (dy / d) * MAX_REACH
                if (!s.dragging) {
                    // 上限で跳ね返す。減衰させないと壁を擦り続ける。
                    s.vx *= 0.4
                    s.vy *= 0.4
                }
            }
        }

        const step = (dt) => {
            s.nextJitter -= dt
            if (s.nextJitter <= 0 && !s.dragging) {
                s.jitter = 1
                s.vx += (110 + Math.random() * 90) * (Math.random() < 0.5 ? -1 : 1)
                s.vy -= Math.random() * 60
                s.nextJitter = 4 + Math.random() * 5
            }
            s.jitter *= Math.exp(-dt / 0.55)

            let alert = 0
            let awx = 0
            let awy = 0
            if (s.hasPointer && canHover) {
                const ddx = s.bx - s.px
                const ddy = s.by - s.py
                const pd = Math.hypot(ddx, ddy) || 1
                if (pd < 140) {
                    alert = 1 - pd / 140
                    awx = (ddx / pd) * alert * alert * 1400
                    awy = (ddy / pd) * alert * alert * 1400
                }
            }

            if (!s.dragging) {
                const dx = s.bx - s.ax
                const dy = s.by - s.ay
                const dist = Math.hypot(dx, dy) || 1
                const tx = s.ax + (dx / dist) * s.L
                const ty = s.ay + (dy / dist) * s.L
                s.vx += (W2 * (tx - s.bx) - C * s.vx + awx) * dt
                s.vy += (W2 * (ty - s.by) + G - C * s.vy + awy) * dt
                s.bx += s.vx * dt
                s.by += s.vy * dt
            }

            clampReach()

            // 高ぶり：掴んでいる > ジタバタ > カーソル近接
            const target = s.dragging ? 1 : Math.max(s.jitter, alert * 0.55)
            s.excite += (target - s.excite) * (1 - Math.exp(-dt / 0.09))
            s.legT += dt * 5.0 * (1 + s.excite * 1.75)
            s.antT += dt * 2.1 * (1 + s.excite * 1.2)
        }

        const render = () => {
            const dx = s.bx - s.ax
            const dy = s.by - s.ay
            const dist = Math.hypot(dx, dy) || 1

            wrap.style.transformOrigin = `${s.size / 2}px ${s.attachY}px`
            wrap.style.transform =
                `translate3d(${s.bx - s.size / 2}px,${s.by - s.attachY}px,0) ` +
                `rotate(${Math.atan2(dx, dy) * (180 / Math.PI) * 0.6}deg)`

            // 糸。速度で反り、たるみで下がる
            const slack = Math.max(0, s.L - dist)
            const cx = (s.ax + s.bx) / 2 - s.vx * 0.01
            const cy = (s.ay + s.by) / 2 + slack * 0.45 + Math.abs(s.vx) * 0.004
            thread.setAttribute('d', `M${s.ax} ${s.ay} Q${cx} ${cy} ${s.bx} ${s.by}`)

            // 脚。i*π/3 の位相差で左右が逆位相になる。前脚だけ周期と振幅を変えている。
            const amp = 4 + s.excite * 6
            for (let i = 0; i < LEGS.length; i++) {
                const el = legsRef.current[i]
                if (!el) continue
                const g = LEGS[i]
                const p = g.p
                const sn = Math.sin(s.legT * (g.arm ? 1.45 : 1) + (i * Math.PI) / 3)
                const a = amp * (g.arm ? 1.25 : 1)
                el.setAttribute(
                    'points',
                    `${p[0]},${p[1]} ` +
                        `${p[2] + sn * a * 0.22 * g.side},${p[3] + sn * a * 0.6} ` +
                        `${p[4] + sn * a * 0.35 * g.side},${p[5] + sn * a}`
                )
            }

            const lean = (s.hasPointer ? Math.max(-1, Math.min(1, (s.px - s.bx) / 220)) : 0) * 1.6
            const aw = Math.sin(s.antT) * (0.5 + s.excite * 1.6)
            const lx = 21.8 + lean + aw
            const ly = 7 - Math.abs(aw) * 0.3
            const rx = 42.2 + lean - aw
            const ry = 7 - Math.abs(aw) * 0.3
            antLRef.current?.setAttribute('d', `M27.5 12.5 C25.5 9, ${23.5 + lean} 7.5, ${lx} ${ly}`)
            antRRef.current?.setAttribute('d', `M36.5 12.5 C38.5 9, ${40.5 + lean} 7.5, ${rx} ${ry}`)
            antLtRef.current?.setAttribute('cx', String(lx))
            antLtRef.current?.setAttribute('cy', String(ly))
            antRtRef.current?.setAttribute('cx', String(rx))
            antRtRef.current?.setAttribute('cy', String(ry))

            let ex = 0
            let ey = 0
            if (s.hasPointer && canHover) {
                const vdx = s.px - s.bx
                const vdy = s.py - s.by
                const vd = Math.hypot(vdx, vdy) || 1
                ex = (vdx / vd) * 1.1
                ey = (vdy / vd) * 0.9
            }
            pupLRef.current?.setAttribute('cx', String(28.7 + ex))
            pupLRef.current?.setAttribute('cy', String(18.3 + ey))
            pupRRef.current?.setAttribute('cx', String(35.9 + ex))
            pupRRef.current?.setAttribute('cy', String(18.3 + ey))
            hiLRef.current?.setAttribute('cx', String(27.8 + ex * 0.6))
            hiLRef.current?.setAttribute('cy', String(16.7 + ey * 0.6))
            hiRRef.current?.setAttribute('cx', String(35 + ex * 0.6))
            hiRRef.current?.setAttribute('cy', String(16.7 + ey * 0.6))
        }

        measure()
        s.bx = s.ax
        s.by = s.ay + s.L + STRETCH
        render()

        // reduced-motion では吊られた姿だけ見せる。掴めない・揺れない。
        if (reduce) {
            wrap.style.cursor = 'default'
            const onResize = () => {
                measure()
                s.bx = s.ax
                s.by = s.ay + s.L + STRETCH
                render()
            }
            window.addEventListener('resize', onResize)
            this.cleanup = () => window.removeEventListener('resize', onResize)
            return
        }

        let last = 0
        let acc = 0
        let lastDt = 1 / 60
        let raf = 0
        let onScreen = true

        const io = new IntersectionObserver((entries) => {
            onScreen = entries[0]?.isIntersecting ?? true
        })
        io.observe(layer)

        const toLocal = (e) => {
            const box = layer.getBoundingClientRect()
            return { x: e.clientX - box.left, y: e.clientY - box.top }
        }

        const onPointerDown = (e) => {
            e.preventDefault()
            wrap.setPointerCapture(e.pointerId)
            wrap.dataset.held = 'true'
            const p = toLocal(e)
            s.dragging = true
            s.offX = p.x - s.bx
            s.offY = p.y - s.by
            s.vx = 0
            s.vy = 0
        }

        const onPointerMove = (e) => {
            const p = toLocal(e)
            s.px = p.x
            s.py = p.y
            s.hasPointer = true
            if (!s.dragging) return
            const nx = p.x - s.offX
            const ny = p.y - s.offY
            const d = Math.max(lastDt, 1 / 240)
            s.vx = Math.max(-2600, Math.min(2600, (nx - s.bx) / d))
            s.vy = Math.max(-2600, Math.min(2600, (ny - s.by) / d))
            s.bx = nx
            s.by = ny
            clampReach()
        }

        const release = (e) => {
            if (!s.dragging) return
            s.dragging = false
            delete wrap.dataset.held
            if (e.pointerId != null && wrap.hasPointerCapture(e.pointerId)) {
                wrap.releasePointerCapture(e.pointerId)
            }
        }

        const onKeyActivate = (event) => {
            if (event.detail !== 0) return
            s.vx += 180
            s.vy -= 100
        }

        const onResize = () => {
            measure()
            if (!s.dragging) {
                s.bx = s.ax
                s.by = s.ay + s.L + STRETCH
                s.vx = 0
                s.vy = 0
            }
        }

        wrap.addEventListener('pointerdown', onPointerDown)
        wrap.addEventListener('lostpointercapture', release)
        wrap.addEventListener('click', onKeyActivate)
        window.addEventListener('pointermove', onPointerMove, { passive: true })
        window.addEventListener('pointerup', release)
        window.addEventListener('pointercancel', release)
        window.addEventListener('resize', onResize)

        // ワードマークは 17.4vw なので、字の大きさが変われば吊り位置も変わる。
        const word = this.element.closest(".title-row").querySelector("h1")
        const ro = new ResizeObserver(() => measure())
        if (word) ro.observe(word)

        const loop = (t) => {
            const dt = last ? (t - last) / 1000 : 1 / 60
            last = t
            lastDt = dt
            if (onScreen) {
                acc = Math.min(acc + dt, MAX_ACC)
                while (acc >= STEP) {
                    step(STEP)
                    acc -= STEP
                }
                render()
            } else {
                acc = 0
            }
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)

        this.cleanup = () => {
            cancelAnimationFrame(raf)
            io.disconnect()
            ro.disconnect()
            wrap.removeEventListener('pointerdown', onPointerDown)
            wrap.removeEventListener('lostpointercapture', release)
            wrap.removeEventListener('click', onKeyActivate)
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', release)
            window.removeEventListener('pointercancel', release)
            window.removeEventListener('resize', onResize)
        }
  }
}
