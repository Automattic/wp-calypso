Product Plan Overlap Notices
=======

Product Plan Overlap Notices is a React component for rendering a block with notices.

Those notices will appear when there is a feature overlap between the current plan and the current product, when they are within the provided list of products and plans.

## Usage

```jsx
import React from 'react';
import ProductPlanOverlapNotices from 'blocks/product-plan-overlap-notices';

const jetpackPlans = [
	'jetpack_personal',
	'jetpack_personal_monthly',
	'jetpack_premium',
	'jetpack_premium_monthly',
	'jetpack_business',
	'jetpack_business_monthly',
];

const jetpackProducts = [
	'jetpack_backup_daily',
	'jetpack_backup_daily_monthly',
	'jetpack_backup_realtime',
	'jetpack_backup_realtime_monthly',
];

export default class extends React.Component {
	render() {
		return (
			<ProductPlanOverlapNotices plans={ jetpackPlans } products={ jetpackProducts } />
		);
	}
}
```

## Props

The following props can be passed to the Product Plan Overlap Notices block:

* `plans`: ( array ) Array of plan slugs that we consider as possibly overlapping with products.
* `products`: ( array ) Array of product slugs that we consider as possibly overlapping with plans.
* `siteId`: ( number ) ID of the site we're fetching purchases and plans for. Optional - currently selected site will be used by default.
