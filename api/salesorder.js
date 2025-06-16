export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing sales order ID" });
  }

  const accessToken = process.env.ZOHO_ACCESS_TOKEN;
  const orgId = process.env.ZOHO_ORG_ID;

  if (!accessToken || !orgId) {
    return res.status(500).json({ error: "Missing environment variables" });
  }

  const url = `https://inventory.zohoapis.com/api/v1/salesorders/${id}?organization_id=${orgId}`;

  try {
    const zohoRes = await fetch(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`
      }
    });

    const data = await zohoRes.json();

    if (!zohoRes.ok) {
      console.error("Zoho API error:", data);
      return res.status(zohoRes.status).json({
        error: data.message || "Failed to fetch sales order from Zoho"
      });
    }

    const items = data.salesorder.line_items.map(item => ({
      name: item.name,
      sku: item.sku
    }));

    return res.status(200).json(items);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
