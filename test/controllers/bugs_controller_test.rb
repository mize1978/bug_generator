require "test_helper"

class BugsControllerTest < ActionDispatch::IntegrationTest
  test "returns 200 on root" do
    get root_url
    assert_response :success
  end

  test "renders an error-box" do
    get root_url
    assert_select ".error-box"
  end

  test "renders a category badge" do
    get root_url
    assert_select ".bug-category"
  end

  test "BUGS constant has 5 categories" do
    assert_equal 5, BugsController::BUGS.keys.size
  end

  test "BUGS constant has at least 50 messages total" do
    total = BugsController::BUGS.values.sum(&:size)
    assert total >= 50, "Expected >= 50 bugs, got #{total}"
  end

  test "BUGS constant is frozen" do
    assert BugsController::BUGS.frozen?
  end

  test "bug counter increments on each visit" do
    get root_url
    get root_url
    assert_select ".bug-counter"
  end
end
