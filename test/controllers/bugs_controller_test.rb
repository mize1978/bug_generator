require "test_helper"

class BugsControllerTest < ActionDispatch::IntegrationTest
  test "first visit waits for an explicit generation" do
    get root_url
    assert_response :success
    assert_select ".bug-btn strong", "バグる"
    assert_select ".standby-card"
    assert_select ".stack-trace", count: 0
    assert_select ".copy-btn[disabled]"
  end

  test "generate button creates the selected category result" do
    get root_url(category: "work", roll: "1")
    assert_response :success
    assert_select ".bug-category", "仕事"
    assert_select ".bug-btn strong", "もう一回バグる"
  end

  test "category selection constrains the generated report" do
    get root_url(category: "love", seed: 42)
    assert_response :success
    assert_select ".bug-category", "恋愛"
    assert_select ".stack-trace", /heart\.rb/
    assert_select ".category-chip.selected", "恋愛"
  end

  test "shared links reproduce the report with retry available" do
    get root_url(category: "code", seed: 728)
    first = css_select(".error-box").first.text
    get root_url(category: "code", seed: 728)
    assert_equal first, css_select(".error-box").first.text
    assert_select ".bug-btn strong", "もう一回バグる"
  end

  test "daily rare is stable and shareable" do
    get root_url(category: "work", mode: "daily", day: "2026-10-16")
    first = css_select(".error-box").first.text
    assert_select ".error-box"
    get root_url(category: "work", mode: "daily", day: "2026-10-16", seed: 1)
    assert_equal first, css_select(".error-box").first.text
    assert_select ".bug-btn strong", "もう一回バグる"
  end

  test "rare results have a visible badge and a sound hook" do
    get root_url(category: "code", seed: 5)
    assert_select ".result-panel.is-rare"
    assert_select ".report-state", /RARE BUG/
    assert_select ".error-box.rare"
  end

  test "invalid category date and seed are handled" do
    get root_url(category: "<script>", seed: "invalid", mode: "daily", day: "invalid")
    assert_response :success
    assert_select ".category-chip.selected", "おまかせ"
    assert_select ".error-box"
  end
end
