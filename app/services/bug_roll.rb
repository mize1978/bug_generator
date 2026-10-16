require "date"
require "zlib"

# Reproducible, fictional results; no AI or external service is used.
class BugRoll
  CATEGORIES = {
    "work" => ["仕事", "office", [
      ["会議が次の会議を召喚しました", "Meeting.spawn", "Calendar.find_free_slot"],
      ["定時がログアウトしました", "Clock.leave_on_time", "Task.append"],
      ["コーヒー残量が業務の必要量を下回りました", "Coffee.refill", "Focus.restore"],
      ["締め切りだけが倍速で動いています", "Deadline.approach", "Human.catch_up"],
      ["『ちょっとだけ』が3時間を返しました", "Request.estimate", "Schedule.rebuild"],
      ["有給の申請先が異世界でした", "Holiday.request", "Manager.locate"]
    ]],
    "love" => ["恋愛", "heart", [
      ["既読の先から応答がありません", "Message.wait_reply", "Heart.retry"],
      ["好きな人の前だけ語彙が消えました", "Words.load", "Conversation.start"],
      ["脳内デートの予約が本番に反映されません", "Date.simulate", "Reality.deploy"],
      ["目が合った回数を過剰に集計しました", "EyeContact.count", "Hope.increment"],
      ["送信ボタンの前で勇気が停止しました", "Courage.load", "Message.send"],
      ["理想の条件で検索結果が0件になりました", "Partner.search", "Filter.relax"]
    ]],
    "study" => ["勉強", "study", [
      ["参考書を開いた瞬間、睡眠処理が始まりました", "Book.open", "Sleep.schedule"],
      ["蛍光ペンだけが成長しています", "Marker.highlight", "Memory.save"],
      ["昨日覚えた単語がキャッシュから消えました", "Vocabulary.load", "Memory.find"],
      ["机の片づけで勉強時間を使い切りました", "Desk.clean", "Study.begin"],
      ["解説を読んだ自分と解く自分が別プロセスです", "Answer.understand", "Question.solve"],
      ["試験範囲が残り時間に収まりません", "Syllabus.load", "Time.allocate"]
    ]],
    "code" => ["プログラミング", "app", [
      ["昨日は動いていたコードが記憶喪失です", "Yesterday.run", "Today.reproduce"],
      ["セミコロン1個に午後を捧げました", "Parser.read", "Developer.stare"],
      ["バグを1個直すと3個返ってきました", "Bug.fix", "Regression.spawn"],
      ["ローカルでしか動かない才能が開花しました", "Local.run", "Production.deploy"],
      ["変数名を考える処理が終了しません", "Name.think", "Implementation.wait"],
      ["原因不明のまま直ってしまいました", "Error.reproduce", "Mystery.resolve"]
    ]],
    "life" => ["日常", "life", [
      ["休日が一瞬でガベージコレクションされました", "Weekend.start", "Monday.collect"],
      ["冷蔵庫を開いても献立が生成されません", "Fridge.open", "Dinner.generate"],
      ["スマホを探すためスマホのライトを使いました", "Phone.find", "Hand.inspect"],
      ["やる気のダウンロードが99%で止まりました", "Motivation.fetch", "Tomorrow.retry"],
      ["二度寝の再帰処理から戻れません", "Alarm.snooze", "Sleep.repeat"],
      ["買い物メモを家に置いてきました", "Shopping.start", "Memo.load"]
    ]]
  }.freeze
  TYPES = ["NotFoundError", "TimeoutException", "BufferOverflow", "InfiniteLoopError", "ConnectionRefused", "UnexpectedNull"].freeze
  LEVELS = [["INFO", "ひと休みで再起動できそう", 12..29], ["WARNING", "今日は省エネ運転で", 30..54], ["ERROR", "ひとつずつ切り分けよう", 55..79], ["CRITICAL", "まず休憩を優先しよう", 80..99]].freeze
  HINTS = ["再試行の前に、水をひと口。", "タスクをひとつだけ小さくしてみよう。", "今日はセーブして終了してもOK。", "誰かに話すとログが整理されるかも。", "完璧より、ひとつ進めば成功。", "深呼吸して、別のルートから試そう。"].freeze

  def self.daily_seed(day, category)
    Zlib.crc32("bug-generator-v1:#{day}:#{category}")
  end

  def self.build(seed:, category: "all", daily: false)
    rng = Random.new(seed)
    key = CATEGORIES.key?(category) ? category : CATEGORIES.keys.sample(random: rng)
    label, file, scenarios = CATEGORIES.fetch(key)
    message, *frames = scenarios.sample(random: rng)
    type = TYPES.sample(random: rng)
    level, status, range = LEVELS.sample(random: rng)
    severity = rng.rand(range)
    rare = daily || rng.rand(12).zero?
    trace = frames.map { |frame| "  at #{frame} (#{file}.rb:#{rng.rand(12..240)})" }
    trace << "  at Human.try_again (everyday.rb:#{rng.rand(1..99)})"
    hint = HINTS.sample(random: rng)
    {
      id: "#{category}-#{seed}", seed: seed, category_key: category, category: label,
      type: type, message: message, level: level, severity: severity, status: status,
      trace: trace, hint: hint, rare: rare, daily: daily,
      text: "[#{level}] #{type}\n#{message}\n深刻度: #{severity}%\n\n#{trace.join("\n")}\n\nHint: #{hint}"
    }
  end
end
