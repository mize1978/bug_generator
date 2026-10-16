import { Controller } from "@hotwired/stimulus"

const KEY = "bug-generator-collection-v1"
const blank = () => ({ history: [], favorites: [], days: {} })
export default class extends Controller {
  static targets = ["stats", "favorite", "status", "history", "favorites", "historyCount", "favoriteCount", "storageNote"]
  static values = { result: Object, url: String, day: String, track: Boolean }

  connect() {
    this.records = blank()
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null")
      if (saved && Array.isArray(saved.history) && Array.isArray(saved.favorites) && saved.days && typeof saved.days === "object" && !Array.isArray(saved.days)) {
        this.records.history = saved.history.filter(x => this.valid(x)).slice(0, 100)
        this.records.favorites = saved.favorites.filter(x => this.valid(x)).slice(0, 50)
        this.records.days = Object.fromEntries(Object.entries(saved.days).filter(([day, count]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isSafeInteger(count) && count > 0))
      }
    } catch (_) { this.storageWarning() }
    const cutoff = this.shiftDay(this.dayValue, -29)
    this.records.history = this.records.history.filter(x => x.day >= cutoff)
    this.records.days = Object.fromEntries(Object.entries(this.records.days).filter(([day]) => day >= cutoff && day <= this.dayValue))
    if (this.trackValue && !this.records.history.some(x => x.id === this.resultValue.id && x.day === this.dayValue)) {
      this.records.history.unshift({ ...this.resultValue, url: this.urlValue, day: this.dayValue })
      this.records.history = this.records.history.slice(0, 100)
      this.records.days[this.dayValue] = (this.records.days[this.dayValue] || 0) + 1
    }
    this.persist()
    this.render()
  }

  valid(x) {
    if (!x || typeof x.id !== "string" || typeof x.message !== "string" || typeof x.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x.day) || typeof x.url !== "string") return false
    try { return new URL(x.url).origin === location.origin } catch (_) { return false }
  }

  shiftDay(day, offset) {
    const date = new Date(`${day}T12:00:00Z`)
    date.setUTCDate(date.getUTCDate() + offset)
    return date.toISOString().slice(0, 10)
  }

  storageWarning() {
    this.storageNoteTarget.textContent = "ブラウザへの保存ができません。この画面内のみで記録しています。"
  }

  persist() {
    try { localStorage.setItem(KEY, JSON.stringify(this.records)) } catch (_) { this.storageWarning() }
  }

  render() {
    let streak = 0
    while (this.records.days[this.shiftDay(this.dayValue, -streak)] && streak < 30) streak++
    this.statsTarget.textContent = `今日 ${this.records.days[this.dayValue] || 0} 回バグった 🐞 · ${streak} 日連続（直近30日）`
    const favorite = this.records.favorites.some(x => x.id === this.resultValue.id)
    this.favoriteTarget.textContent = favorite ? "★ 保存済み" : "☆ お気に入り"
    this.favoriteTarget.setAttribute("aria-pressed", String(favorite))
    this.historyCountTarget.textContent = `(${this.records.history.length})`
    this.favoriteCountTarget.textContent = `(${this.records.favorites.length}/50)`
    this.renderList(this.historyTarget, this.records.history, true)
    this.renderList(this.favoritesTarget, this.records.favorites, false)
  }

  renderList(target, records, grouped) {
    target.replaceChildren()
    if (!records.length) { target.textContent = grouped ? "生成したバグがここに残ります。" : "気に入ったバグを☆で保存しよう。"; return }
    let day = ""
    records.forEach(record => {
      if (grouped && record.day !== day) {
        day = record.day
        const heading = document.createElement("h3")
        heading.textContent = day
        target.append(heading)
      }
      const row = document.createElement("div")
      row.className = "saved-row"
      const link = document.createElement("a")
      link.href = record.url
      link.textContent = `${record.rare ? "✦ " : ""}${record.message}`
      row.append(link)
      if (!grouped) {
        const remove = document.createElement("button")
        remove.type = "button"
        remove.className = "remove-favorite"
        remove.textContent = "解除"
        remove.setAttribute("aria-label", `お気に入り解除：${record.message}`)
        remove.addEventListener("click", () => {
          this.records.favorites = this.records.favorites.filter(x => x.id !== record.id)
          this.persist(); this.render()
        })
        row.append(remove)
      }
      target.append(row)
    })
  }

  favorite() {
    const exists = this.records.favorites.some(x => x.id === this.resultValue.id)
    if (exists) this.records.favorites = this.records.favorites.filter(x => x.id !== this.resultValue.id)
    else {
      if (this.records.favorites.length >= 50) { this.statusTarget.textContent = "お気に入りは50件まで。不要な保存を解除してから追加してください。"; return }
      this.records.favorites.unshift({ ...this.resultValue, url: this.urlValue, day: this.dayValue })
    }
    this.persist(); this.render()
    this.statusTarget.textContent = exists ? "お気に入りを解除しました。" : "★ お気に入りに保存しました。"
  }

  async share() {
    try {
      if (navigator.share) await navigator.share({ title: "Bug Generator", text: this.resultValue.message, url: this.urlValue })
      else { await navigator.clipboard.writeText(this.urlValue); this.statusTarget.textContent = "✓ 同じ結果を開けるリンクをコピーしました！" }
    } catch (error) {
      if (error.name !== "AbortError") this.statusTarget.textContent = "共有できませんでした。こちらのリンクを使ってください。 " + this.urlValue
    }
  }

  async saveImage() {
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 1200; canvas.height = 1000
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, canvas.width, canvas.height)
      const accent = this.resultValue.rare ? "#facc15" : "#f87171"
      ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.strokeRect(46, 46, 1108, 908)
      ctx.fillStyle = "#f8fafc"; ctx.font = "bold 42px monospace"; ctx.fillText("BUG GENERATOR", 82, 117)
      ctx.font = "24px sans-serif"; ctx.fillStyle = accent
      ctx.fillText(`${this.resultValue.category} / ${this.resultValue.level} / ${this.resultValue.severity}%${this.resultValue.rare ? " / RARE" : ""}`, 82, 175)
      let y = 255
      const line = (text, font, color, height = 44) => {
        ctx.font = font; ctx.fillStyle = color
        let buffer = ""
        for (const char of Array.from(text)) {
          if (ctx.measureText(buffer + char).width > 1035) { ctx.fillText(buffer, 82, y); y += height; buffer = "" }
          buffer += char
        }
        ctx.fillText(buffer, 82, y); y += height
      }
      line(this.resultValue.type, "bold 36px monospace", accent)
      y += 12; line(this.resultValue.message, "32px sans-serif", "#f8fafc", 48)
      y += 38
      this.resultValue.trace.forEach(text => line(text, "24px monospace", "#a5b4cf", 36))
      y += 30; line(`HINT: ${this.resultValue.hint}`, "26px sans-serif", "#a7f3d0", 40)
      ctx.fillStyle = "#94a3b8"; ctx.font = "22px sans-serif"; ctx.fillText("バグを笑いに変えるミニアプリ。 / 架空のエラーログ", 82, 905)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("Image export failed")
      const url = URL.createObjectURL(blob), link = document.createElement("a")
      link.href = url; link.download = `bug-${this.resultValue.seed}.png`; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      this.statusTarget.textContent = "✓ 画像を保存しました。リンク共有なら同じ結果も開けます。"
    } catch (_) { this.statusTarget.textContent = "画像保存ができませんでした。コピーまたはリンク共有をお試しください。" }
  }
}
