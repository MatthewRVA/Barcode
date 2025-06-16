export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing code from Zoho redirect");
  }

  const client_id = process.env.ZOHO_CLIENT_ID;
  const client_secret = process.env.ZOHO_CLIENT_SECRET;
  const redirect_uri = "https://barcode-three-zeta.vercel.app/api/auth";

  try {
    const bodyParams = new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: "authorization_code"
    });

    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Zoho Token Error:", tokenData);
      return res.status(400).json(tokenData);
    }

    res.status(200).json({
      message: "Token exchange successful",
      tokenData
    });

  } catch (err) {
    console.error("Token Exchange Error:", err);
    res.status(500).json({ error: "Token exchange failed", details: err.message });
  }
}
