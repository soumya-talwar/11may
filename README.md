# 11-MAY — Whatsapp Birthday Bot

11-May is an automation that sends me AI-generated WhatsApp compliments every hour on my birthday. 

It runs as a scheduled job that selects from a dataset of personal wins and generates a contextual message for each run.

<br>

## ✨ Features

### 🎉 Scheduled Compliment Delivery

Sends a message every hour on May 11.

* Runs on a cron schedule via GitHub Actions
* No manual intervention once deployed

### 🧠 AI-Generated Compliments

Each message is dynamically generated using an LLM.

* Based on a selected personal win
* Varies output across runs to avoid repetition

### 🧩 Personalized Data Layer

Compliments are generated from a dataset of personal wins.

* Each run selects one entry at random
* Images are included if available for the selected win

### 🔁 Stateless Execution

Each run is independent and self-contained.

* No persistent server required
* No dependency on previous runs

<br>

## 🧱 Tech Stack

* **Runtime:** Node.js
* **Scheduling:** GitHub Actions (cron)
* **AI:** Gemini API 
* **Messaging:** Twilio WhatsApp API

<br>

## 🧠 How it Works

1. A scheduled workflow triggers the system at defined intervals
2. The script:
   * Loads a dataset of personal wins
   * Selects one at random
3. The selected win is passed into an LLM
4. The LLM generates a short compliment
5. A message payload is constructed:
   * Text (AI-generated)
   * Optional media
6. The message is sent via WhatsApp API

<br>

## 🧩 Example Output

> *“Happy birthday! 🎉 You’ve been coding since you were 12 and somehow turned that into real, working systems? That’s not luck — that’s years of obsession paying off.”*
