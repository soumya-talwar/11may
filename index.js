import "dotenv/config";

import OpenAI from "openai";
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

import { readFile } from "fs/promises";
const data = JSON.parse(
	await readFile(new URL("./data/wins.json", import.meta.url))
);

const interval = 1000 * 60 * 60;

function compliment() {
	let win =
		data.wins[Math.floor(Math.random(data.wins.length) * data, wins.length)];
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
					mediaUrl: win.image,
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
