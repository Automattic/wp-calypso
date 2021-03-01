# Flat Rate

This module is used to manage the settings for a shipping method of the type "Flat Rate". This is used to
charge the user a constant amount, independently of the order cost or weight.

## Reducer

The shipping method has the following properties:

- `tax_status` (String): Whether the shipping cost is subject to taxes (`"taxable"`) or not (`"none"`).
- `cost` (Number): The fixed cost (without taxes) that the customer will pay for shipping.
