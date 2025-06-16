import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing sales order ID" });

  try {
    // 1. Get your Zoho access token (you might want to fetch from your refresh token logic)
    const accessToken = process.env.ZOHO_ACCESS_TOKEN; // or fetch dynamically if needed

    // 2. Call the Zoho Inventory salesorder API with the ID
    const response = await fetch(`https://www.zohoapis.com/inventory/v1/salesorders/${id}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();

    // 3. Extract the line_items with quantity and product details
    // Zoho returns line_items as an array with fields including quantity, name, and sku (or item_code)
    const items = data.salesorder.line_items.map(item => ({
      name: item.item_name,
      sku: item.item_code || item.sku || "N/A",
      quantity: item.quantity,
    }));

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
