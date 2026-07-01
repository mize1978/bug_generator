# 🐞 Bug Generator

人生、バグってない？🐞  
今日のあなたのエラーを診断するアプリです。  
「エンジニアあるある」をネタに、ランダムなバグメッセージを生成してXでシェアできます。

---

## 🌐 デモ
https://bug-generator.onrender.com

---

## 🖼️ スクリーンショット

<p align="center">
  <img src="https://raw.githubusercontent.com/mize1978/bug_generator/main/app/assets/images/ogp.png" width="480" alt="Bug Generator スクリーンショット">
</p>

---

## ✨ 機能
- バグ（エラー）をランダム表示（35種類以上）
- 「もう一回バグる」で再生成
- X（Twitter）シェア機能（テンプレートランダム）
- レアバグ（20%の確率）：💥 付きで金色にきらめく演出

---

## 🎯 こだわり
- 「エンジニアあるある」のセリフを実際のエラー構文に落とし込んだ設計
- ロジック（シェアテキスト生成）はコントローラに集約し、ビューをシンプルに
- モバイル対応のレスポンシブUI
- OGP対応でシェアしたくなるデザイン

---

## 🛠 技術スタック
- Ruby on Rails 7
- Docker / Docker Compose
- SQLite
- HTML / CSS

---

## 🚀 セットアップ

```bash
git clone https://github.com/mize1978/bug_generator
cd bug_generator
docker compose up
```

http://localhost:3000 にアクセス

---

## 💡 制作メモ

シンプルなアプリだからこそ、「コードの責務の分離」や「ビューをロジックフリーに保つ」ことを意識して作りました。  
BUGS 定数の切り出し、シェアテキストのコントローラ管理など、小さいながらも実務に近い設計を練習しています。
