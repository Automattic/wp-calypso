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

* `basePlansPath`: ( string ) Plans page base path.
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
	* `optionDescriptions`: ( object ) Optional descriptions for the product options.
	They replace a default `description` in case a given option (represented by the object's key) has been purchased.
	Each key is a product slug, and the value is the corresponding copy. Example:
		```
		optionDescriptions: {
			jetpack_backup_daily: translate( 'Looking for more? Get unlimited real-time backup archives' ),
			jetpack_backup_daily_monthly: translate( 'Looking for more? Get unlimited real-time backup archives' ),
			jetpack_backup_realtime: translate( 'Your changes are saved as you edit and you have unlimited backup archives' ),
			jetpack_backup_realtime_monthly: translate( 'Your changes are saved as you edit and you have unlimited backup archives' ),
		}
		```
	* `optionDisplayNames`: ( object ) Optional display names of the product options.
	They replace a default `title` in case a given option (represented by the object's key) has been purchased.
	Each key is a product slug, and the value is the corresponding title. Example:
		```
		optionDisplayNames: {
			jetpack_backup_daily: translate( 'Jetpack Backup Daily' ),
			jetpack_backup_daily_monthly: translate( 'Jetpack Backup Daily' ),
			jetpack_backup_realtime: translate( 'Jetpack Backup Real-Time' ),
			jetpack_backup_realtime_monthly: translate( 'Jetpack Backup Real-Time' ),
		}
		```
	* `optionShortNames`: ( object ) Optional short names of the product options.
	They are used in the product card options listing and in action button (when upgrading).
	Each key is a product slug, and the value is the corresponding title. Example:
		```
		optionShortNames: {
			jetpack_backup_daily: translate( 'Daily Backups' ),
			jetpack_backup_daily_monthly: translate( 'Daily Backups' ),
			jetpack_backup_realtime: translate( 'Real-Time Backups' ),
			jetpack_backup_realtime_monthly: translate( 'Real-Time Backups' ),
		}
		```
	* `optionsLabel`: ( string ) Title of the product options section.
* `productPriceMatrix`: ( object ) Matrix of product price relationships. Each key is a product slug, and each value is an object with the following structure:
	* `relatedProduct`: ( string ) Slug of the related product.
	* `ratio`: ( number ) Ratio between original plan and related plan. Example: for a `yearly` to `monthly` plan, this should be `12`.

	Example:
	```
	productPriceMatrix: {
		jetpack_backup_daily: {
			relatedProduct: jetpack_backup_daily_monthly,
			ratio: 12,
		},
		jetpack_backup_realtime: {
			relatedProduct: jetpack_backup_realtime_monthly,
			ratio: 12,
		},
	}
	```
* `siteId`: ( number ) ID of the site we're retrieving purchases for. Used to fetch information about the associated purchases of the selected products.
