class BugsController < ApplicationController
  def index
    bugs = [
      "NoMethodError: やる気が見つかりません",
      "500 Internal Server Error: 月曜日が原因です",
      "ValidationError: ごほうびが不足しています",
      "RoutingError: 人生のルートが見つかりません",
      "TimeoutError: やる気の応答がありません",
      "ActiveRecord::RecordNotFound: 休日が見つかりません",
      "SyntaxError: 人生の構文が間違っています",
      "ArgumentError: 引数にやる気を渡してください",
      "NameError: モチベーションが定義されていません",
      "TypeError: やる気は String ではありません",
      "SystemStackError: 考えすぎです",
      "LoadError: 元気を読み込めませんでした",
      "ZeroDivisionError: やる気 / 0",
      "FrozenError: 心が凍っています",
      "RuntimeError: 今日は無理です",
      "SecurityError: 月曜日は危険です",
      "IOError: 外の世界にアクセスできません",
      "EncodingError: 気持ちが文字化けしています",
      "NoMemoryError: 脳の容量が足りません",
      "Interrupt: 休憩します",
      "DeprecationWarning: 昔のやる気は使えません",
      "UnknownError: よくわからないけど無理",
      "FatalError: 二度寝しました",
      "RetryError: 明日やります",
      "PermissionDenied: 今日は働けません",
      "404 Not Found: やる気が見つかりません",
      "undefined method `ganbaru' for nil:NilClass",
      "Connection refused: 社会との接続が拒否されました",
      "Segmentation fault: メンタルが壊れました",
      "Rollback: やる気を元に戻します",
      "仕様です（圧）",
      "昨日は動いてたんだけどな…",
      "再現できませんでした（完）",
      "それバグじゃなくて自分です",
      "寝れば直る（直らない）"
    ]

    @bug = bugs.sample

    @rare = rand < 0.2
    @bug = "💥 #{@bug}" if @rare
  end
end