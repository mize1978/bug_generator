class BugsController < ApplicationController
  BUGS = {
    "月曜日" => [
      "500 Internal Server Error: 月曜日が原因です",
      "SecurityError: 月曜日は危険です",
      "FatalError: 月曜日から逃げられません",
      "CriticalError: 月曜日の朝は全てが壊れます",
      "PanicError: 月曜日を検知しました",
    ],
    "やる気" => [
      "NoMethodError: やる気が見つかりません",
      "ValidationError: ごほうびが不足しています",
      "TimeoutError: やる気の応答がありません",
      "NameError: モチベーションが定義されていません",
      "ZeroDivisionError: やる気 / 0",
      "LoadError: 元気を読み込めませんでした",
      "DeprecationWarning: 昔のやる気は使えません",
      "404 Not Found: やる気が見つかりません",
      "PermissionDenied: 今日は働けません",
      "RetryError: 明日やります",
      "OverflowError: 残業が溢れています",
      "NullPointerException: コーヒーがありません",
    ],
    "人生" => [
      "RoutingError: 人生のルートが見つかりません",
      "SyntaxError: 人生の構文が間違っています",
      "ArgumentError: 引数にやる気を渡してください",
      "SystemStackError: 考えすぎです",
      "FrozenError: 心が凍っています",
      "Connection refused: 社会との接続が拒否されました",
      "Segmentation fault: メンタルが壊れました",
      "IOError: 外の世界にアクセスできません",
      "EncodingError: 気持ちが文字化けしています",
      "ActiveRecord::RecordNotFound: 休日が見つかりません",
      "GarbageCollectionError: 心のゴミが回収されません",
      "RaceCondition: 締め切りと体力が競合しています",
    ],
    "あるある" => [
      "RuntimeError: 今日は無理です",
      "NoMemoryError: 脳の容量が足りません",
      "Interrupt: 休憩します",
      "UnknownError: よくわからないけど無理",
      "FatalError: 二度寝しました",
      "TypeError: やる気は String ではありません",
      "Rollback: やる気を元に戻します",
      "undefined method `ganbaru' for nil:NilClass",
      "IndexError: 〆切が範囲外です",
      "DeadlockError: 会議が会議を呼んでいます",
    ],
    "仕様です" => [
      "仕様です（圧）",
      "昨日は動いてたんだけどな…",
      "再現できませんでした（完）",
      "それバグじゃなくて自分です",
      "寝れば直る（直らない）",
      "それ、私のPCだと動くんですよね",
      "コンソール見たら全部エラーでした（涼しい顔）",
      "コミットしたら消えました",
      "なぜか直りました（原因不明）",
      "バグじゃなくてフィーチャーです",
    ],
  }.freeze

  def index
    @category, bugs_in_category = BUGS.flat_map { |cat, bs| bs.map { |b| [cat, b] } }.sample
    @bug  = bugs_in_category
    @rare = rand < 0.2
    @bug  = "💥 #{@bug}" if @rare

    templates = [
      "🐞 今日のバグ：#{@bug} #BugGenerator",
      "🐞 今日のバグ：#{@bug}\nあるあるすぎて泣いた😂 #BugGenerator",
      "🐞 今日のバグ：#{@bug}\n再現できませんでした（完） #BugGenerator",
      "🐞 今日のバグ：#{@bug}\n仕様です（圧） #BugGenerator",
      "🔮 今日のバグ運：#{@bug}\nあなたも引いてみる？ #BugGenerator"
    ]

    @share_text = templates.sample
    @share_url  = request.original_url
  end
end
