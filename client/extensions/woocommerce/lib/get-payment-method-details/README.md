# Get payment method details

WooCommerce core does not have a concept of:

- on-site, off-site, or offline
- payment gateway fee summary
- is suggested gateway
- Url for more information

This functionality has been broken out as the type mapping should eventually go
away. This is a temporary fix until core and payment gateways add compatibility.

The module takes a payment method id and returns and object containing
additional details not in the API response from WooCommerce
