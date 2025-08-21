// index.js
import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Store tokens in environment variables (not inside code!)
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const NEWS_API = process.env.NEWS_API;

// Hugging Face AI
async function aiReply(prompt) {
  const res = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-large", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });
  const data = await res.json();
  return data[0]?.generated_text || "⚠️ Couldn’t generate a reply.";
}

// News Fetch
async function getNews(topic) {
  const res = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&apiKey=${NEWS_API}`
  );
  const data = await res.json();
  if (!data.articles || data.articles.length === 0) return "⚠️ No news found.";
  return `📰 ${data.articles[0].title}\n${data.articles[0].url}`;
}

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith("!ai")) {
    const prompt = msg.content.replace("!ai", "").trim();
    const reply = await aiReply(prompt);
    msg.reply(reply);
  }

  if (msg.content.startsWith("!news")) {
    const topic = msg.content.replace("!news", "").trim();
    const reply = await getNews(topic || "latest");
    msg.reply(reply);
  }
});

client.login(DISCORD_TOKEN);
