const fetch = require('node-fetch');

async function getTokens(authCode) {
  const params = new URLSearchParams();
  params.append('code', authCode);
  params.append('client_id', process.env.ZOHO_CLIENT_ID);
  params.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
  params.append('redirect_uri', 'https://barcode-three-zeta.vercel.app/api/auth');
  params.append('grant_type', 'authorization_code');

  const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;  // contains access_token, refresh_token, expires_in, etc.
}
