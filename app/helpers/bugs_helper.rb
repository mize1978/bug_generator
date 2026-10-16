module BugsHelper
  # エラー名を1文字ずつのspanに分ける。CSSの遅延で打鍵演出をするので、
  # レイアウトは最初から確定していて、打っている途中で改行位置が動かない。
  # 単語（CamelCaseの区切り）の間でだけ折り返す。
  def typed_error_name(name)
    index = -1
    words = name.scan(/[A-Z]?[^A-Z]+|[A-Z]+(?![a-z])/)
    words = [name] if words.join != name

    parts = words.map do |word|
      chars = word.each_char.map do |char|
        index += 1
        tag.span(char, class: "error-char", style: "--i:#{index}")
      end
      tag.span(safe_join(chars), class: "error-word", aria: { hidden: true })
    end
    safe_join(parts, tag.wbr)
  end
end
