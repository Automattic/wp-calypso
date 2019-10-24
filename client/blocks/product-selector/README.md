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
		optionsLabel: 'Backup options',
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
* `products`: ( array ) Products to render, each with the following structure:
	* `title`: ( string ) Product title.
	* `description`: ( string ) Product description.
	* `id`: ( string ) Product ID.
	* `options`: ( object ) Product options. Each option has the billing interval as a key, and the value is an array with corresponding product slugs. Example:
		```
		options: {
			yearly: [ 'jetpack_backup_daily', 'jetpack_backup_realtime' ],
			monthly: [ 'jetpack_backup_daily_monthly', 'jetpack_backup_realtime_monthly' ],
		}
		```
	* `optionNames`: ( object ) Optional names of the product options. Each key is a product slug, and the value is the corresponding title. Example:
		```
		optionsNames: {
			jetpack_backup_daily: 'Daily Backups',
			jetpack_backup_daily_monthly: 'Daily Backups',
			jetpack_backup_realtime: 'Real-Time Backups',
			jetpack_backup_realtime_monthly: 'Real-Time Backups',
		}
		```
	* `optionsLabel`: ( string ) Title of the product options section.
* `siteId`: ( number ) ID of the site we're retrieving purchases for. Used to fetch information about the associated purchases of the selected products.
