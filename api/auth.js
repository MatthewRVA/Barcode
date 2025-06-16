import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code from Zoho redirect');
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.ZOHO_CLIENT_ID);
    params.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
    params.append('redirect_uri', process.env.ZOHO_REDIRECT_URI);
    params.append('code', code);

    const tokenRes = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(500).json({ error: tokenData.error, description: tokenData.error_description });
    }

    // Success - show tokens
    return res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; padding: 2em;">
          <h2>✅ Access Token Created</h2>
          <p><strong>Access Token:</strong></p>
          <code style="background: #eee; padding: 1em; display: block; margin: 1em 0;">${tokenData.access_token}</code>
          <p><strong>Refresh Token:</strong></p>
          <code style="background: #eee; padding: 1em; display: block; margin: 1em 0;">${tokenData.refresh_token}</code>
          <p>Store these in your environment variables to authenticate API requests.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Token exchange error:", err);
    res.status(500).send('Error exchanging code for token');
  }
}

