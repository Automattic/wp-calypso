Product Plan Overlap Notices
=======

Product Plan Overlap Notices is a React component for rendering a block with notices.

Those notices will appear when there is a feature overlap between the current plan and any products, when they are within the provided list of products and plans.

## Usage

```jsx
import React from 'react';
import ProductPlanOverlapNotices from 'blocks/product-plan-overlap-notices';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { JETPACK_PLANS } from 'lib/plans/constants';

export default class extends React.Component {
	render() {
		return (
			<ProductPlanOverlapNotices plans={ JETPACK_PLANS } products={ JETPACK_PRODUCTS_LIST } />
		);
	}
}
```

## Props

The following props can be passed to the Product Plan Overlap Notices block:

* `plans`: ( array ) Array of plan slugs that we consider as possibly overlapping with products.
* `products`: ( array ) Array of product slugs that we consider as possibly overlapping with plans.
* `siteId`: ( number ) ID of the site we're fetching purchases and plans for. Optional - currently selected site will be used by default.
* `currentPurchase`: ( object ) Optional: The current purchase. Used for the purchase detail page to hide the notice when not relevant.
