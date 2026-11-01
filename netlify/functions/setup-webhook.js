
exports.handler = async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: "TELEGRAM_BOT_TOKEN is missing"
    };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: "https://tourmaline-dasik-f3349a.netlify.app/.netlify/functions/bot"
        })
      }
    );

    const result = await response.json();

    return {
      statusCode: response.ok ? 200 : 502,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ok: result.ok,
        description: result.description || "Webhook setup finished"
      })
    };
  } catch {
    return {
      statusCode: 500,
      body: "Could not contact Telegram API"
    };
  }
};
