export default async function handler(req, res) {
  const soID = req.query.id;
  const accessToken = process.env.ZOHO_ACCESS_TOKEN;
  const orgID = process.env.ZOHO_ORG_ID;

  if (!soID) {
    return res.status(400).json({ error: "Missing Sales Order ID" });
  }

  if (!accessToken || !orgID) {
    return res.status(500).json({ error: "Missing Zoho credentials in environment variables" });
  }

  try {
    const zohoRes = await fetch(`https://inventory.zoho.com/api/v1/salesorders/${soID}?organization_id=${orgID}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`
      }
    });

    if (zohoRes.status === 401) {
      return res.status(401).json({ error: "Unauthorized - Access token may have expired" });
    }

    if (!zohoRes.ok) {
      const errorBody = await zohoRes.text();
      return res.status(zohoRes.status).json({ error: "Zoho API error", details: errorBody });
    }

    const json = await zohoRes.json();

    if (!json.salesorder) {
      return res.status(404).json({ error: "Sales order not found" });
    }

    const items = json.salesorder.line_items.map(item => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity
    }));

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}

