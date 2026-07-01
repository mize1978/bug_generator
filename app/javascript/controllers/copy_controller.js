import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["btn"]
  static values  = { text: String }

  copy() {
    navigator.clipboard.writeText(this.textValue).then(() => {
      const btn = this.btnTarget
      const orig = btn.textContent
      btn.textContent = "✓ コピー！"
      btn.classList.add("copy-btn--done")
      setTimeout(() => {
        btn.textContent = orig
        btn.classList.remove("copy-btn--done")
      }, 1500)
    })
  }
}
