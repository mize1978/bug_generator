// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" && e.code !== "Enter") return
  if (["BUTTON", "A", "INPUT", "TEXTAREA"].includes(e.target.tagName)) return
  e.preventDefault()
  document.querySelector(".bug-btn")?.click()
})

document.addEventListener("turbo:load", () => {
  console.log(
    "%c 🐞 Bug Generator %c built by mize ",
    "background:#ef4444;color:#fff;font-size:13px;font-weight:bold;padding:5px 10px;border-radius:6px 0 0 6px;",
    "background:#0f172a;color:#f87171;font-size:13px;font-weight:bold;padding:5px 10px;border-radius:0 6px 6px 0;"
  )
  console.log("%c ✦ github.com/mize1978/bug_generator", "color:#ef4444;font-size:11px;padding-left:2px;")
})
