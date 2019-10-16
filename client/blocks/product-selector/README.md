Product Selector
=======

Product Selector is a React component for rendering a block with products that are available for purchase.

It's used on the plans page near the bundle plans grid and is intended to provide an interface for purchasing specific products.

## Usage

```jsx
import React from 'react';
import ProductSelector from 'blocks/product-selector';

const products = [
	{
		title: 'Jetpack Backup',
		description: 'Always-on backups ensure you never lose your site. Your changes are saved as you edit and you have unlimited backup archives',
		id: 'jetpack_backup',
		options: {
			yearly: [ 'jetpack_backup_daily', 'jetpack_backup_realtime' ],
			monthly: [ 'jetpack_backup_daily_monthly', 'jetpack_backup_realtime_monthly' ],
		},
	}
];

const interval = 'yearly';

export default class extends React.Component {
	render() {
		return (
			<ProductSelector products={ products } intervalType={ interval } />
		);
	}
}
```

## Props

The following props can be passed to the Product Selector block:

* `intervalType`: ( string ) Billing interval - `monthly`, `yearly` or `2yearly`.
* `products`: ( array ) Products to render - see example above for the structure.
