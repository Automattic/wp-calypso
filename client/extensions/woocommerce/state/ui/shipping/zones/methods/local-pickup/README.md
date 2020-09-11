# Local Pickup

This module is used to manage the settings for a shipping method of the type "Local Pickup". This is used to allow
the customer to go pickup their order to the store/wharehouse. Since that doesn't cost anything to the merchant, this option is usually
offered for free, but the merchant is allowed to charge an arbitrary amount.

## Reducer

The shipping method has the following properties:

- `tax_status` (String): Whether the shipping cost is subject to taxes (`"taxable"`) or not (`"none"`).
- `cost` (Number): The fixed cost (without taxes) that the customer will pay for shipping.
