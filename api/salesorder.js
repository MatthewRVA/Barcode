import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing sales order ID' });
  }

  // Step 1: Refresh the access token
  const refreshRes = await fetch(`${process.env.BASE_URL || 'https://barcode-three-zeta.vercel.app'}/api/refresh`);
  const tokenData = await refreshRes.json();

  if (!refreshRes.ok || !tokenData.access_token) {
    return res.status(500).json({ error: 'Failed to refresh token', details: tokenData });
  }

  const accessToken = tokenData.access_token;

  // Step 2: Use the token to call Zoho Inventory API
  const zohoRes = await fetch(`https://www.zohoapis.com/inventory/v1/salesorders/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-com-zoho-inventory-organizationid': process.env.ZOHO_ORG_ID, // Make sure this env var is set
    },
  });

  const zohoData = await zohoRes.json();

  if (!zohoRes.ok || !zohoData.salesorder) {
    return res.status(500).json({ error: 'Failed to fetch sales order', details: zohoData });
  }

  // Step 3: Extract line items
  const lineItems = zohoData.salesorder.line_items.map(item => ({
    name: item.name,
    sku: item.sku,
  }));

  res.status(200).json(lineItems);
}
