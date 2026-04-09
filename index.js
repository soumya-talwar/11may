import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import twilio from "twilio";
import { readFile } from "fs/promises";

const { GEMINI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, PHONE_NUMBER } =
	process.env;

if (
	!GEMINI_API_KEY ||
	!TWILIO_ACCOUNT_SID ||
	!TWILIO_AUTH_TOKEN ||
	!PHONE_NUMBER
) {
	throw new Error("Missing required environment variables");
}

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const WHATSAPP_FROM = "whatsapp:+14155238886";
const WHATSAPP_TO = `whatsapp:+91${PHONE_NUMBER}`;

async function loadWins() {
	const file = await readFile(new URL("data/wins.json", import.meta.url));
	return JSON.parse(file).wins;
}

function getRandomItem(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function isBirthday(date = new Date()) {
	// return date.getDate() === 11 && date.getMonth() === 4;
	return true;
}

async function generateCompliment(win) {
	const intensity = Math.random() < 0.5 ? "very " : "";
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash-lite",
		contents: [
			{
				role: "user",
				parts: [
					{
						text: `Give me a ${intensity}short birthday compliment about how ${win.text}. Keep it fun, playful, and include one emoji.`,
					},
				],
			},
		],
	});
	return response.text;
}

async function sendWhatsAppMessage({ body, mediaUrl }) {
	const message = {
		body,
		from: WHATSAPP_FROM,
		to: WHATSAPP_TO,
	};
	if (mediaUrl) message.mediaUrl = [mediaUrl];
	await twilioClient.messages.create(message);
}

async function sendCompliment(wins) {
	try {
		const win = getRandomItem(wins);
		console.log("Selected win:", win.text);
		const text = await generateCompliment(win);
		console.log("Generated compliment:", text);
		await sendWhatsAppMessage({
			body: text,
			mediaUrl:
				`https://raw.githubusercontent.com/soumya-talwar/11may/main/data/images/${win.image}` ||
				null,
		});
		console.log("Compliment sent!");
	} catch (error) {
		console.error("Failed to send compliment:", error);
	}
}

async function main() {
	console.log("Birthday bot running...");
	const wins = await loadWins();
	const now = new Date();
	if (isBirthday(now)) {
		console.log("It's your birthday!");
		await sendCompliment(wins);
	} else {
		console.log("Not your birthday. Exiting.");
	}
	process.exit(0);
}

main();
