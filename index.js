import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import twilio from "twilio";
import { readFile, writeFile } from "fs/promises";

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
	apiKey: GEMINI_API_KEY,
});

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const WHATSAPP_FROM = "whatsapp:+14155238886";
const WHATSAPP_TO = `whatsapp:+91${PHONE_NUMBER}`;

const USED_WINS_FILE = new URL("./data/used-wins.json", import.meta.url);

async function loadWins() {
	const file = await readFile(new URL("data/wins.json", import.meta.url));
	return JSON.parse(file).wins;
}

async function loadUsedWins() {
	try {
		const file = await readFile(USED_WINS_FILE);
		return JSON.parse(file);
	} catch {
		return [];
	}
}

async function saveUsedWins(usedWins) {
	await writeFile(USED_WINS_FILE, JSON.stringify(usedWins, null, 2));
}

function isBirthday(date = new Date()) {
	return (
		(date.getDate() === 10 || date.getDate() === 11) && date.getMonth() === 4
	);
}

function getAvailableWins(wins, usedWins) {
	return wins.filter((win) => !usedWins.includes(win.text));
}

function getRandomItem(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

async function generateCompliment(win) {
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash-lite",
		contents: [
			{
				role: "user",
				parts: [
					{
						text: `
						You are texting a friend a funny birthday compliment over WhatsApp.

						The compliment must be based on this fact:

						"${win.text}"

						Rules:
						- Sound like a real person texting their friend
						- Be casual, specific, and concise
						- Keep it to 1-3 short sentences
						- Mention their birthday naturally
						- Include one emoji naturally
						- Do not sound inspirational, motivational, or corporate
						- Do not sound like a comedian trying to be funny
						- Avoid exaggerated internet humor
						- Dry humor and understatement work better than punchlines
						- Mild teasing is okay
						- The message should feel personal and observational

						Examples of tone ONLY:
						- "You’re unmarried at 29 and still alive. Revolutionary behavior for a Punjabi family. Happy birthday 😭"
						- "Happy birthday to someone who successfully convinced a corporation to keep them around"
						- "You have a functioning liver and a head full of hair. Some people genuinely dream of this life 🫡"
						- "Pushing a bully down the stairs in kindergarten is insane lore to casually carry around. Happy birthday 💀"

						Now write ONE original message.
						`,
					},
				],
			},
		],
	});

	return response.text.trim();
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
		const usedWins = await loadUsedWins();
		let availableWins = getAvailableWins(wins, usedWins);
		if (availableWins.length === 0) {
			console.log("All wins used. Resetting history.");
			await saveUsedWins([]);
			availableWins = wins;
		}
		const win = getRandomItem(availableWins);
		console.log("Selected win:", win.text);
		const text = await generateCompliment(win);
		console.log("Generated compliment:", text);
		await sendWhatsAppMessage({
			body: text,
			mediaUrl: win.image
				? `https://raw.githubusercontent.com/soumya-talwar/11may/main/data/images/${win.image}`
				: null,
		});
		usedWins.push(win.text);
		await saveUsedWins(usedWins);
		console.log("Compliment sent!");
	} catch (error) {
		console.error("Failed to send compliment:", error);
	}
}

async function main() {
	console.log("Birthday bot running...");
	const wins = await loadWins();
	if (isBirthday()) {
		console.log("It's your birthday!");
		await sendCompliment(wins);
	} else {
		console.log("Not your birthday. Exiting.");
	}
	process.exit(0);
}

main();
