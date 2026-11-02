
exports.handler = async function () {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: "Missing server configuration" })
    };
  }

  try {
    const response = await fetch(
      url.replace(/\/$/, "") + "/rest/v1/students?select=id&limit=1",
      { headers: { apikey: key } }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: response.ok,
        supabaseStatus: response.status,
        message: response.ok ? "Connection successful" : "Supabase rejected the request"
      })
    };
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, message: "Connection failed" })
    };
  }
};
