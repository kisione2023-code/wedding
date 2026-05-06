import dotenv from "dotenv";
dotenv.config();

async function run() {
  const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "accounts/fireworks/models/llama-v2-7b-chat",
      messages: [
        { role: "user", content: "Привет!" }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  console.log("Ответ модели:");
  console.log(data);
  console.log("Текст:");
  console.log(data?.choices?.[0]?.message?.content);
}

run();