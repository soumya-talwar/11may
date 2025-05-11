import "dotenv/config";

import OpenAI from "openai";
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

let wins;
let interval = 1000 * 60 * 60;

fetch(
	`https://raw.githubusercontent.com/soumya-talwar/host/refs/heads/main/wins.json?token=${process.env.GITHUB_TOKEN}`
)
	.then((response) => response.json())
	.then((data) => (wins = data.wins));

function compliment() {
	let win = wins[Math.floor(Math.random(wins.length) * wins.length)];
	openai.chat.completions
		.create({
			model: "gpt-4o-mini",
			store: true,
			messages: [
				{
					role: "user",
					content: `Give me a ${
						Math.random() < 0.5 ? "very" : ""
					} short birthday compliment about how ${
						win.text
					}. Keep it fun & playful, and add an emoji`,
				},
			],
		})
		.then(async (output) => {
			let params;
			if (win.image)
				params = {
					body: output.choices[0].message.content,
					from: "whatsapp:+14155238886",
					mediaUrl: `https://raw.githubusercontent.com/soumya-talwar/host/refs/heads/main/images/${win.image}?token=${process.env.GITHUB_TOKEN}`,
					to: `whatsapp:+91${process.env.PHONE_NUMBER}`,
				};
			else
				params = {
					body: output.choices[0].message.content,
					from: "whatsapp:+14155238886",
					to: `whatsapp:+91${process.env.PHONE_NUMBER}`,
				};
			await client.messages.create(params);
			console.log("complimented!");
			console.log("compliment: " + output.choices[0].message.content);
		});
}

let start = setInterval(() => {
	let date = new Date();
	let day = date.getDate();
	let month = date.getMonth() + 1;
	if (day == 11 && month == 5) compliment();
	else if (day == 12) {
		console.log("shutting down!");
		clearInterval(start);
	}
}, interval);
