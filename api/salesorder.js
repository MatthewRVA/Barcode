import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing sales order ID' });
  }

  try {
    // Step 1: Get a fresh access token from your refresh endpoint
    const tokenRes = await fetch(`${process.env.BASE_URL}/api/refresh`);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    // Step 2: Fetch the sales order
    const zohoRes = await fetch(`https://www.zohoapis.com/inventory/v1/salesorders/${id}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${tokenData.access_token}`
      }
    });

    const zohoData = await zohoRes.json();

    if (!zohoRes.ok) {
      return res.status(zohoRes.status).json({ error: 'Failed to fetch sales order', details: zohoData });
    }

    // Step 3: For each line item, fetch item details to get custom field cf_print_barcodes
    const itemsWithCustomFields = await Promise.all(
      (zohoData.salesorder?.line_items || []).map(async (item) => {
        // Fetch item details
        const itemRes = await fetch(`https://www.zohoapis.com/inventory/v1/items/${item.item_id}`, {
          headers: {
            Authorization: `Zoho-oauthtoken ${tokenData.access_token}`
          }
        });

        const itemData = await itemRes.json();

        let cfPrintBarcode = false;
        if (itemRes.ok && itemData.item?.custom_fields) {
          const cfField = itemData.item.custom_fields.find(f => f.api_name === 'cf_print_barcodes');
          if (cfField) {
            // Checkbox field can be boolean or string 'true'
            cfPrintBarcode = cfField.value === true || cfField.value === 'true';
          }
        }

        return {
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          customer_name: zohoData.salesorder.customer_name,
          salesorder_number: zohoData.salesorder.salesorder_number,
          cf_print_barcodes: cfPrintBarcode
        };
      })
    );

    // Step 4: Return the enriched items
    res.status(200).json(itemsWithCustomFields);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
