# 11MAY

### A WhatsApp bot that compliments me every hour on my birthday

11may is a tiny birthday bot that sends me a new compliment every hour throughout my birthday.

The compliments are generated from a collection of real facts about me.

## How it works

Each time the script runs, it:

1. Checks whether it's my birthday.
2. Loads the list of wins.
3. Picks one that hasn't been used yet.
4. Sends the win to **Gemini** with a prompt describing the tone of the compliment.
5. Sends the generated message to me on **WhatsApp** using Twilio.
6. Records the win as used so it doesn't repeat itself.

```text
Personal wins
      │
      ▼
 Pick an unused win
      │
      ▼
 Gemini generates a compliment
      │
      ▼
 Twilio → WhatsApp
      │
      ▼
 Mark win as used
```

If a win has an associated image, the bot sends that along with the compliment.

## Example Output

> _“Happy birthday! 🎉 You have a functioning liver and a head full of hair. Some people genuinely dream of this life 🫡”_

## Built with

- **Node.js**
- **Google Gemini API**
- **Twilio WhatsApp API**
- **GitHub Actions**
