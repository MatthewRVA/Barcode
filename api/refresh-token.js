// pages/api/refresh.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      return res.status(500).json({ error: "Missing environment variables" });
    }

    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');

    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zoho Token Refresh Error:", errorText);
      return res.status(500).json({ error: "Failed to refresh token", details: errorText });
    }

    const data = await response.json();
    console.log("Access token received:", data.access_token);

    // You might want to store access_token somewhere secure for reuse
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in
    });

  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).json({ error: err.message });
  }
}
