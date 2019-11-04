Product Card
=======

Product Card is a React component for rendering a box with product name, price, short description and additional
information.

It can have a [`<ProductCardOptions />`](#product-card-options) component passed as a child that will render product
purchase options under the product description.

In some cases, e.g. when a lower-tier product has been already purchased, an upgrade button can be displayed using a
[`<ProductCardAction />`](#product-card-action) component. Like the `<ProductCardOptions />` component, it should be
passed as a child to the `<ProductCard />`.

It's used e.g. on `my-plans` page near the bundle plans grid and is intended to render a product card (not a regular
plan).

See p1HpG7-7ET-p2 for more details.

### How to use the `<ProductCard />`

```jsx
import React from 'react';
import ProductCard from 'components/product-card';

export default class extends React.Component {
	render() {
		return (
			<ProductCard
				title="Jetpack Scan"
				billingTimeFrame={ 'per year' }
				fullPrice={ 25 }
				description={
					<p>
						Automatic scanning and one-click fixes keep your site one step ahead of security
						threats. <a href="/plans">More info</a>
					</p>
				}
			/>
		);
	}
}
```

### <a name="how-purchase-prop-works"></a>How `purchase` prop works

The component can be in two visual and functional states:
* `purchase` prop is not set - the product plan prices will be rendered below the highlighted title. If the product
has purchase options, they will be listed below the description.
* `purchase` prop is set - the content area will not contain product options (if they exist).

### `<ProductCard />` props

The following props can be passed to the Product Card component:

* `billingTimeFrame`: ( string ) Billing time frame label
* `currencyCode`: ( string ) Currency code
* `description`: ( string | element ) Product description. It can be a string or a React element (e.g. `<Fragment>`)
* `discountedPrice`: ( number | array ) Discounted price of the product. If an array of 2 numbers is passed, it will be
 displayed as a price range
* `fullPrice`: ( number | array ) Full price of a product. If an array of 2 numbers is passed, it will be displayed as
 a price range
* `isPlaceholder`: ( bool ) Flag indicating if a product price is in a loading state and should be rendered as a
  placeholder
* `purchase`: ( object ) A purchase object, associated with the product. [Read more about the way this flag
 works](#how-purchase-prop-works)
* `subtitle`: ( string | element | node ) Product subtitle. It's used if the product has already been purchased, but can be
 used also in other use-cases. It can be a string, a node or a React element (e.g. `<Fragment>`)
* `title`: ( string | element ) Product title. It can be a string or a React element (e.g. `<Fragment>`)

<a name="product-card-options"></a>Product Card Options
=======

Product Card Options is a Product Card's sub-component for rendering purchase options inside the card. It's meant to
be passed to the Product Card as a child component.

### How to use the `<ProductCardOptions />`

```jsx
import React, { useState } from 'react';
import ProductCard from 'components/product-card';
import ProductCardOptions from 'components/product-card-options';

export default class extends React.Component {
	const [ selectedProductOption, selectProductOption ] = useState( 'jetpack_backup_realtime_monthly' );

	render() {
		return (
			<ProductCard
				title="Jetpack Backup"
				billingTimeFrame={ 'per month' }
				fullPrice={ [ 16, 25 ] }
				discountedPrice={ [ 12, 16 ] }
				description={
					<p>
						Always-on backups ensure you never lose your site. Choose from real-time or daily
						backups. <a href="/plans">Which one do I need?</a>
					</p>
				}
			>
				<ProductCardOptions
					optionsLabel="Backup options:"
					options={ [
						{
							billingTimeFrame={ 'per month' }
							discountedPrice: 12,
							fullPrice: 14,
							slug: 'jetpack_backup_daily_monthly',
							title: 'Daily Backups',
						},
						{
							billingTimeFrame={ 'per month' }
							fullPrice: 25,
							slug: 'jetpack_backup_realtime_monthly',
							title: 'Real-Time Backups',
						},
					] }
					selectedSlug={ selectedProductOption }
					handleSelect={ slug => selectProductOption( slug ) }
				/>
			</ProductCard>
		);
	}
}
```

### `<ProductCardOptions />` Props

The following props can be passed to the Product Card Options component:

* `handleSelect`: ( func ) Handler function for option selection. A product option `slug` is passed as an argument to
 the handler function
* `options`: ( array ) List of product options to render Each option should be an object. The shape of an option
 object is as follows:
  * `options.billingTimeFrame`: ( string ) Billing time frame label
  * `options.currencyCode`: ( string ) Currency code
  * `options.discountedPrice`: ( number | array ) Discounted price of a product option. If an array of 2 numbers is
   passed, it will be displayed as a price range
  * `options.fullPrice`: ( number | array ) Full price of a product option. If an array of 2 numbers is passed, it
   will be displayed as a price range
  * `options.title`: ( string | element ) Product option title. It can be a string or a React element
   (e.g. `<Fragment>`)
  * `options.slug`: ( string ) Option slug
* `optionsLabel`: ( string ) Label that is displayed above the list of product options
* `selectedSlug`: ( string ) Currently selected product option slug

<a name="product-card-action"></a>Product Card Action
=======

Product Card Action is a Product Card's sub-component for rendering action section. It consists of an intro
text (optional) and a button.

### How to use the `<ProductCardAction />`

```jsx
import React from 'react';
import ProductCard from 'components/product-card';
import ProductCardAction from 'components/product-card-action';

export default class extends React.Component {
	render() {
		return (
			<ProductCard
				title={
					<Fragment>
						Jetpack Backup <strong>Daily</strong>
					</Fragment>
				}
				subtitle="Purchased 2019-09-13"
				description={
					<p>
						<strong>Looking for more?</strong> With Real-time backups:, we save as you edit and
						you’ll get unlimited backup archives
					</p>
				}
			>
				<ProductCardAction
					intro="Get Real-Time Backups $16 /year"
					label="Upgrade to Real-Time Backups"
				/>
			</ProductCard>
		);
	}
}
```

### `<ProductCardAction />` Props

The following props can be passed to the Product Card Action component:

* `intro`: ( string ) Intro text to be displayed above the action button
* `label`: ( string ) Action button text
* `onClick`: ( func ) Action button click event handler
