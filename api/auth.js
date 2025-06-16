const params = new URLSearchParams({
  code: codeFromQuery,                // the code you got from redirect query
  client_id: process.env.ZOHO_CLIENT_ID,
  client_secret: process.env.ZOHO_CLIENT_SECRET,
  redirect_uri: "https://barcode-three-zeta.vercel.app/api/auth",
  grant_type: "authorization_code"
});

const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: params.toString()
});
