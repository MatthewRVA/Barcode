export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    const params = new URLSearchParams({
      code: code,
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      redirect_uri: "https://barcode-three-zeta.vercel.app/api/auth",
      grant_type: "authorization_code",
    });

    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Zoho token error:", data);
      return res.status(response.status).json({ error: data });
    }

    // Log success data for debugging (remove in production)
    console.log("Zoho token success:", data);

    return res.status(200).json(data);
  } catch (error) {
    console.error("API auth error:", error);
    return res.status(500).json({ error: error.message });
  }
}

