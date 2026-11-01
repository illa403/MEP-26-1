
exports.handler = async function () {
  var url = process.env.SUPABASE_URL;
  var key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: "Missing environment variables" })
    };
  }

  try {
    var apiUrl = url.replace(/\/$/, "") + "/rest/v1/students?select=id&limit=1";
    var response = await fetch(apiUrl, {
      headers: { apikey: key }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: response.ok,
        supabaseStatus: response.status,
        message: response.ok ? "Connection successful" : "Supabase rejected the request"
      })
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, message: "Connection failed" })
    };
  }
};
