import "dotenv/config";

import OpenAI from "openai";
const openai = new OpenAI({
	apiKey: process.env.APIKEY,
});

import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

function compliment() {
	openai.chat.completions
		.create({
			model: "gpt-4o-mini",
			store: true,
			messages: [
				{
					role: "user",
					content:
						"give me a short compliment on my birthday about how i caught 2 fish in 10 seconds",
				},
			],
		})
		.then(async (output) => {
			await client.messages.create({
				body: output.choices[0].message.content,
				from: "whatsapp:+14155238886",
				mediaUrl:
					"https://raw.githubusercontent.com/soumya-talwar/may11/refs/heads/main/data/images/fish.mp4",
				to: `whatsapp:+91${process.env.PHONENUMBER}`,
			});
			console.log("complimented!");
			console.log("compliment: " + output.choices[0].message.content);
		});
}

compliment();

// let interval = 1000 * 3; // 3 seconds
// // let interval = 1000 * 60 * 30; // 30 minutes

// let birthday = setInterval(() => {
// 	let date = new Date();
// 	let day = date.getDate();
// 	let month = date.getMonth() + 1;
// 	if (day == 10 && month == 5) compliment();
// 	else if (day == 12) {
// 		console.log("shutting down!");
// 		clearInterval(birthday);
// 	}
// }, interval);
