const CUSTOMFIELD_ID = '5072431000006561001';

const items = (zohoData.salesorder?.line_items || []).map(item => {
  console.log('Custom fields for item:', item.name, item.custom_fields);

  const cfField = item.custom_fields?.find(f => f.customfield_id === CUSTOMFIELD_ID);
  
  let cfPrintBarcode = false;
  if (cfField) {
    console.log('Found custom field:', cfField);
    // Handle possible value types: string 'true', boolean true, number 1, etc.
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
