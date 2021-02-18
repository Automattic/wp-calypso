# Free Shipping

This module is used to manage the settings for a shipping method of the type "Free Shipping". This is used to
allow the customer to get their order shipped for free, if it satisfies some defined requirements.

## Reducer

The shipping method has the following properties:

- `requires` (String): Type of condition that must be satisfied for an order to qualify for free shipping. It can be one of the following:
  - `""`: No requirement. Every order is eligible for free shipping.
  - `"coupon"`: The order must have a valid coupon to be eligible for free shipping.
  - `"min_amount"`: The order must be of at least the specified monetary amount to qualify.
  - `"either"`: The order must be of at least the specified monetary amount, **OR** have a valid coupon.
  - `"both"`: The order must be of at least the specified monetary amount, **AND** have a valid coupon.
- `min_amount` (Number): Optional. The minimum order amount for the order to qualify for free shipping. Note that this will be ignored if `required` is `""` or `"coupon"`.
