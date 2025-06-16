import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET } = process.env;

    if (!ZOHO_REFRESH_TOKEN || !ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Missing environment variables' });
    }

    const params = new URLSearchParams();
    params.append('refresh_token', ZOHO_REFRESH_TOKEN);
    params.append('client_id', ZOHO_CLIENT_ID);
    params.append('client_secret', ZOHO_CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');

    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to refresh token', details: data });
    }

    // ⚠️ For production, securely store access_token somewhere like a database or cache.
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
