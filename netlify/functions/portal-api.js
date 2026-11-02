const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { initData } = JSON.parse(event.body || "{}");
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token || !initData || typeof initData !== "string") {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" })
      };
    }

    const params = new URLSearchParams(initData);
    const receivedHash = params.get("hash");

    if (!receivedHash) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid Telegram data" })
      };
    }

    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(token)
      .digest();

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    const a = Buffer.from(receivedHash, "hex");
    const b = Buffer.from(calculatedHash, "hex");

    if (
      a.length !== b.length ||
      !crypto.timingSafeEqual(a, b)
    ) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid Telegram signature" })
      };
    }

    const authDate = Number(params.get("auth_date"));

    if (
      !Number.isFinite(authDate) ||
      Math.abs(Date.now() / 1000 - authDate) > 300
    ) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Expired Telegram data" })
      };
    }

    const user = JSON.parse(params.get("user") || "{}");

    if (!user.id) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Telegram user missing" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        telegramUser: {
          id: String(user.id),
          first_name: user.first_name || ""
        }
      })
    };
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request" })
    };
  }
};
