export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code from Zoho redirect');
  }

  console.log("OAuth Code from Zoho:", code);

  res.status(200).send(`
    <html>
      <body style="font-family: sans-serif; padding: 2em;">
        <h2>✅ Zoho Authorization Successful</h2>
        <p>Your authorization code is:</p>
        <code style="background: #eee; padding: 1em; display: block; margin: 1em 0;">${code}</code>
        <p>Use this code to generate access tokens.</p>Add commentMore actions
      </body>
    </html>
  `);
}
