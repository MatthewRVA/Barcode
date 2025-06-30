// /api/salesorder.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing sales order ID' });
  }

  try {
    // 🔄 Step 1: Get a fresh access token from your refresh endpoint
    const tokenRes = await fetch(`${process.env.BASE_URL}/api/refresh`);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    // ✅ Step 2: Use the token to call Zoho Inventory
    const zohoRes = await fetch(`https://www.zohoapis.com/inventory/v1/salesorders/${id}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${tokenData.access_token}`
      }
    });

    const zohoData = await zohoRes.json();

    if (!zohoRes.ok) {
      return res.status(zohoRes.status).json({ error: 'Failed to fetch sales order', details: zohoData });
    }

    // 📦 Step 3: Extract and send back the item details
    const items = (zohoData.salesorder?.line_items || []).map(item => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      customer_name: zohoData.salesorder.customer_name,
      salesorder_number: zohoData.salesorder.salesorder_number,
      cf_print_barcodes: item.cf_print_barcodes
    }));

    res.status(200).json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
