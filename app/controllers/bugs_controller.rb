class BugsController < ApplicationController
  def index
    @selected_category = BugRoll::CATEGORIES.key?(params[:category]) ? params[:category] : "all"
    @today = Time.now.getlocal("+09:00").to_date
    @daily = params[:mode] == "daily"
    @day = begin
      Date.iso8601(params[:day].to_s)
    rescue ArgumentError
      @today
    end
    supplied_seed = params[:seed].to_s.match?(/\A\d{1,10}\z/) ? params[:seed].to_i : nil
    seed = if @daily
      BugRoll.daily_seed(@day, @selected_category)
    else
      supplied_seed || SecureRandom.random_number(2**32)
    end
    @result = BugRoll.build(seed: seed, category: @selected_category, daily: @daily)
    @track = supplied_seed.nil?
    @share_url = root_url(category: @selected_category, seed: seed, mode: (@daily ? "daily" : nil), day: (@daily ? @day.iso8601 : nil))
    @share_text = "🐞 今日のバグ：#{@result[:message]}\n#{@result[:type]} / #{@result[:level]} #{@result[:severity]}%\n#BugGenerator"
  end
end
