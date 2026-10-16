require "test_helper"

class BugsControllerTest < ActionDispatch::IntegrationTest
  test "category selection constrains the generated report" do
    get root_url(category: "love", seed: 42)
    assert_response :success
    assert_select ".bug-category", "恋愛"
    assert_select ".stack-trace", /heart\.rb/
    assert_select ".category-chip.selected", "恋愛"
  end

  test "shared links reproduce the report without counting another generation" do
    get root_url(category: "code", seed: 728)
    first = css_select(".error-box").first.text
    get root_url(category: "code", seed: 728)
    assert_equal first, css_select(".error-box").first.text
    assert_select "[data-collection-track-value='false']"
  end

  test "daily rare is stable and shareable" do
    get root_url(category: "work", mode: "daily", day: "2026-10-16")
    first = css_select(".error-box").first.text
    assert_select ".error-box.rare"
    get root_url(category: "work", mode: "daily", day: "2026-10-16", seed: 1)
    assert_equal first, css_select(".error-box").first.text
    assert_select "[data-collection-track-value='false']"
  end

  test "invalid category date and seed are handled" do
    get root_url(category: "<script>", seed: "invalid", mode: "daily", day: "invalid")
    assert_response :success
    assert_select ".category-chip.selected", "おまかせ"
    assert_select ".error-box.rare"
  end
end
