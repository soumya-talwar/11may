import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
	apiKey: process.env.APIKEY,
});

const completion = openai.chat.completions.create({
	model: "gpt-4o-mini",
	store: true,
	messages: [
		{ role: "user", content: "give me a short compliment on my birthday" },
	],
});

completion.then((result) => console.log(result.choices[0].message.content));
