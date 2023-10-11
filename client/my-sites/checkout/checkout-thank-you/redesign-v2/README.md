## ThankYou page redesign v2

This is an ongoing refactor that we're trying to fulfill bit by bit. This file is to share some of the ideas in mind and totally open for discussion.

### Goal

- We want to support multiple products in the redesigned ThankYou page
- Easier to build a simple page by piecing components together, see example `client/my-sites/checkout/checkout-thank-you/domain-transfer-to-any-user/index.tsx`

## Architecture

Example file on how things are ordered: `client/my-sites/checkout/checkout-thank-you/domain-transfer-to-any-user/index.tsx`

```
masterbar-styled/
	// top masterbar, internally used in ThankYouLayout.tsx
sections/: aligned in the order they should appear
  header/
  subheader/
  product/
	// the layout for each product item is a bit different
	// so there would be a dedicated file to a product type
  footer/
  upsell/
ThankYouLayout.tsx: Layout of the ThankYou page
```
