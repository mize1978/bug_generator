require "test_helper"

class BugRollTest < ActiveSupport::TestCase
  test "seeds reproduce the complete result" do
    assert_equal BugRoll.build(seed: 27, category: "study"), BugRoll.build(seed: 27, category: "study")
  end

  test "results vary across error types levels traces and messages" do
    reports = 100.times.map { |seed| BugRoll.build(seed: seed, category: "code") }
    [:type, :level, :trace, :message].each { |field| assert_operator reports.map { |r| r[field] }.uniq.size, :>, 1 }
    assert reports.all? { |r| (12..99).cover?(r[:severity]) && r[:trace].size == 3 }
  end

  test "daily selection varies with day and category" do
    assert_not_equal BugRoll.daily_seed("2026-10-16", "work"), BugRoll.daily_seed("2026-10-17", "work")
    assert_not_equal BugRoll.daily_seed("2026-10-16", "work"), BugRoll.daily_seed("2026-10-16", "love")
  end
end
