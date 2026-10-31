exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const data = JSON.parse(event.body);

    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error("Telegram token not configured");
    }

    const message = data.message?.text;
    const chatId = data.message?.chat?.id;

    if (!message || !chatId) {
      return {
        statusCode: 200,
        body: "OK"
      };
    }

    let reply = "Привіт! Я Telegram-бот. Обери потрібну команду.";

    if (message === "/start") {
      reply = "Вітаю! 👋\n\nРаді вас бачити!";
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    if (!response.ok) {
      throw new Error("Telegram API error");
    }

    return {
      statusCode: 200,
      body: "OK"
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: "Server error"
    };
  }
};
