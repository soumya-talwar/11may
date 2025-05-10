import "dotenv/config";

import OpenAI from "openai";
const openai = new OpenAI({
	apiKey: process.env.APIKEY,
});

import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

import express from "express";
const app = express();
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

let wins;
let interval = 1000 * 15; // 15 seconds

fetch(
	"https://raw.githubusercontent.com/soumya-talwar/may11/refs/heads/main/data/wins.json"
)
	.then((response) => response.json())
	.then((data) => {
		wins = data.wins;
	});

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
					} short birthday compliment about how ${win.text}. Add an emoji too!`,
				},
			],
		})
		.then(async (output) => {
			let params;
			if (win.image)
				params = {
					body: output.choices[0].message.content,
					from: "whatsapp:+14155238886",
					mediaUrl: `https://raw.githubusercontent.com/soumya-talwar/may11/refs/heads/main/data/images/${win.image}`,
					to: `whatsapp:+91${process.env.PHONENUMBER}`,
				};
			else
				params = {
					body: output.choices[0].message.content,
					from: "whatsapp:+14155238886",
					to: `whatsapp:+91${process.env.PHONENUMBER}`,
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
	if (day == 10 && month == 5) compliment();
	else if (day == 12) {
		console.log("shutting down!");
		clearInterval(start);
	}
}, interval);
