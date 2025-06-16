import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const client_id = process.env.ZOHO_CLIENT_ID;
  const client_secret = process.env.ZOHO_CLIENT_SECRET;
  const redirect_uri = 'https://barcode-three-zeta.vercel.app/api/auth';

  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);
  params.append('redirect_uri', redirect_uri);
  params.append('grant_type', 'authorization_code');

  try {
    const tokenRes = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await tokenRes.json();

    if (data.error) {
      return res.status(400).json({ error: data.error, description: data.error_description });
    }

    // Optional: Save the tokens to a database or show them
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch tokens from Zoho' });
  }
}
