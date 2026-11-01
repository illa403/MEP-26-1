
exports.handler = async () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        message: "Missing Supabase environment variables"
      })
    };
  }

  try {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/`,
      {
       headers: {
  apikey: key
}
        }
      }
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ok: response.ok,
        supabaseStatus: response.status,
        message: response.ok
          ? "Supabase connection successful"
          : "Supabase responded; check API configuration"
      })
    };
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({
        ok: false,
        message: "Could not connect to Supabase"
      })
    };
  }
};
