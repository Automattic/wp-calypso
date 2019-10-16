Product Card
=======

Product Card is a React component for rendering a box with product short description and purchase options.

It's used e.g. on `my-plans` page near the bundle plans grid and is intended to render a product card (not a regular
plan).

## <a name="how-is-purchased-flag-works"></a>How `isPurchased` flag works

The component can be in two visual and functional states:
* `isPurchased` flag is not set - the product plan prices will be rendered below the highlighted title. If the product
has purchase options, they will be listed below the description.
* `isPurchased` flag is set - the content area will not contain product options (if they exist).

See p1HpG7-7nT-p2 for more details.

## <a name="usage"></a>Usage

```jsx
import React, { useState } from 'react';
import ProductCard from 'components/product-card';

export default class extends React.Component {
	const [ selectedProductOption, selectProductOption ] = useState( 'jetpack_backup_realtime_monthly' );

	render() {
		return (
			<ProductCard
				title="Jetpack Backup"
				description={
					<Fragment>
						Always-on backups ensure you never lose your site. Choose from real-time or daily
						backups. <a href="/plans">Which one do I need?</a>
					</Fragment>
				}
				billingTimeFrame="per year"
				fullPrice={ [ 16, 25 ] }
				discountedPrice={ [ 12, 16 ] }
				optionsLabel="Backup options:"
				options={ [
					{
						discountedPrice: 12,
						fullPrice: 14,
						slug: 'jetpack_backup_daily_monthly',
						title: 'Daily Backups',
					},
					{
						discountedPrice: 16,
						fullPrice: 25,
						slug: 'jetpack_backup_realtime_monthly',
						title: 'Real-Time Backups',
					}
				] }
				selectedSlug={ selectedProductOption }
				handleSelect={ ( slug ) => selectProductOption( slug ) }
			/>
		);
	}
}
```

## Props

The following props can be passed to the Product Card component:

* `billingTimeFrame`: ( string ) Billing time frame label
* `currencyCode`: ( string ) Currency code
* `description`: ( string | element ) Product description. It can be a string or a React element (e.g. `<Fragment>`)
* `discountedPrice`: ( number | array ) Discounted price of the product. If an array of 2 numbers is passed, it will be
  displayed as a price range
* `fullPrice`: ( number | array ) Full price of the product. If an array of 2 numbers is passed, it will be displayed as
  a price range
* `isPurchased`: ( bool ) Flag indicating if the product has already been purchased. [Read more about the way this flag
  works](#how-is-purchased-flag-works)
* `handleSelect`: ( func ) Handler function for product option selection. A product `slug` is passed as an argument to
  the handler function
* `options`: ( array ) List of product options to display inside the card. Each option should be an object. The shape of
  an option object is shown in the [Usage section](#usage) above.
* `optionsLabel`: ( string ) Options label that is displayed above the list of purchase options
* `selectedSlug`: ( string ) Currently selected product option slug
* `subtitle`: ( string | element ) Product subtitle. It's used if the product has already been purchased, but can be
  used also in other use-cases. It can be a string or a React element (e.g. `<Fragment>`)
* `title`: ( string | element ) Product title. It can be a string or a React element (e.g. `<Fragment>`)
