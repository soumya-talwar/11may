import "dotenv/config";

import OpenAI from "openai";
import twilio from "twilio";
import { readFile } from "fs/promises";

const { OPENAI_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, PHONE_NUMBER } =
	process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const WHATSAPP_FROM = "whatsapp:+14155238886";
const WHATSAPP_TO = `whatsapp:+91${PHONE_NUMBER}`;
const INTERVAL_MS = 1000 * 60 * 60;

async function loadWins() {
	const file = await readFile(new URL("./data/wins.json", import.meta.url));
	return JSON.parse(file).wins;
}

function getRandomItem(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function isBirthday(date = new Date()) {
	return date.getDate() === 11 && date.getMonth() === 4;
}

function isDayAfterBirthday(date = new Date()) {
	return date.getDate() === 12 && date.getMonth() === 4;
}

async function generateCompliment(win) {
	const intensity = Math.random() < 0.5 ? "very " : "";
	const response = await openai.responses.create({
		model: "gpt-4.1-mini",
		input: `Give me a ${intensity}short birthday compliment about how ${win.text}. Keep it fun, playful, and include one emoji.`,
	});
	return response.output_text.trim();
}

async function sendWhatsAppMessage({ body, mediaUrl }) {
	const message = {
		body,
		from: WHATSAPP_FROM,
		to: WHATSAPP_TO,
	};
	if (mediaUrl) {
		message.mediaUrl = [mediaUrl];
	}
	await twilioClient.messages.create(message);
}

async function sendCompliment(wins) {
	try {
		const win = getRandomItem(wins);
		const text = await generateCompliment(win);
		await sendWhatsAppMessage({
			body: text,
			mediaUrl: win.image || null,
		});
		console.log("Compliment sent:", text);
	} catch (error) {
		console.error("Failed to send compliment:", error);
	}
}

async function start() {
	const wins = await loadWins();
	console.log("Birthday bot started(!)");
	const interval = setInterval(async () => {
		const now = new Date();
		if (isBirthday(now)) {
			await sendCompliment(wins);
		} else if (isDayAfterBirthday(now)) {
			console.log("Birthday over. Shutting down :(");
			clearInterval(interval);
		} else {
			console.log("Not birthday yet :(");
		}
	}, INTERVAL_MS);
}

start();
