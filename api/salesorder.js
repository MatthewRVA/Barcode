export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing sales order ID' });
  }

  try {
    // Get access token...
    const tokenRes = await fetch(`${process.env.BASE_URL}/api/refresh`);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    // Fetch sales order from Zoho
    const zohoRes = await fetch(`https://www.zohoapis.com/inventory/v1/salesorders/${id}`, {
      headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` }
    });

    const zohoData = await zohoRes.json();

    if (!zohoRes.ok) {
      return res.status(zohoRes.status).json({ error: 'Failed to fetch sales order', details: zohoData });
    }

    // DEBUG: Log the line items to check custom_fields
    console.log('Line items:', JSON.stringify(zohoData.salesorder?.line_items, null, 2));

    // Process items with your custom field logic
    const CUSTOMFIELD_ID = '5072431000006561001';

    const items = (zohoData.salesorder?.line_items || []).map(item => {
      console.log('Custom fields for item:', item.name, item.custom_fields);

      const cfField = item.custom_fields?.find(f => f.customfield_id === CUSTOMFIELD_ID);
      let cfPrintBarcode = false;

      if (cfField) {
        console.log('Found custom field:', cfField);
        const val = cfField.value;
        cfPrintBarcode = (val === true || val === 'true' || val === 1 || val === '1');
      }

      return {
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        customer_name: zohoData.salesorder.customer_name,
        salesorder_number: zohoData.salesorder.salesorder_number,
        cf_print_barcodes: cfPrintBarcode
      };
    });

    res.status(200).json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
