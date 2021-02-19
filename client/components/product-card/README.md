# Product Card

## `ProductCard`

Product Card is a React component for rendering a box with product name, price, short description and additional
information.

It can have a [`<ProductCardOptions />`](#product-card-options) component passed as a child that will render product
purchase options under the product description.

In some cases, e.g. when a lower-tier product has been already purchased, an upgrade button can be displayed using a
[`<ProductCardAction />`](#product-card-action) component. Like the `<ProductCardOptions />` component, it should be
passed as a child to the `<ProductCard />`.

The Product Card may contain a [`<ProductCardPromoNudge />`](#product-card-promo-nudge) consisting of a green star sticker badge and a promo copy.

It's used e.g. on `my-plans` page near the bundle plans grid and is intended to render a product card (not a regular
plan).

See p1HpG7-7ET-p2 for more details.

### How to use the `<ProductCard />`

```jsx
import React, { Fragment } from 'react';
import ProductCard from 'calypso/components/product-card';

export default class extends React.Component {
	render() {
		return (
			<ProductCard
				title="Jetpack Scan"
				billingTimeFrame="per year"
				fullPrice={ 25 }
				description={
					<Fragment>
						Automatic scanning and one-click fixes keep your site one step ahead of security
						threats. <a href="/plans">More info</a>
					</Fragment>
				}
			/>
		);
	}
}
```

### How `purchase` prop works

The component can be in two visual and functional states:

- `purchase` prop is not set - the product plan prices will be rendered below the highlighted title. If the product
  has purchase options, they will be listed below the description.
- `purchase` prop is set - the content area will not contain product options (if they exist).

### `<ProductCard />` props

The following props can be passed to the Product Card component:

- `billingTimeFrame`: ( string ) Billing time frame label
- `currencyCode`: ( string ) Currency code
- `description`: ( string | element | node ) Product description. It can be a string, a node or a React element (e.g. `<Fragment>`)
- `discountedPrice`: ( number | array ) Discounted price of the product. If an array of 2 numbers is passed, it will be
  displayed as a price range
- `fullPrice`: ( number | array ) Full price of a product. If an array of 2 numbers is passed, it will be displayed as
  a price range
- `isPlaceholder`: ( bool ) Flag indicating if a product price is in a loading state and should be rendered as a
  placeholder
- `purchase`: ( object ) A purchase object, associated with the product. [Read more about the way this flag
  works](#how-purchase-prop-works)
- `subtitle`: ( string | element | node ) Product subtitle. It's used if the product has already been purchased, but can be
  used also in other use-cases. It can be a string, a node or a React element (e.g. `<Fragment>`)
- `title`: ( string | element ) Product title. It can be a string or a React element (e.g. `<Fragment>`)

## `ProductCardPromoNudge`

Product Card Promo Nudge is a Product Card's sub-component for rendering a promotion nudge. It consists of a badge label
(a green star sticker to the left) and a promo text. Both props are optional.

### How to use the `<ProductCardPromoNudge />`

```jsx
import React, { Fragment } from 'react';
import ProductCard from 'calypso/components/product-card';
import ProductCardPromoNudge from 'calypso/components/product-card/promo-nudge';

export default class extends React.Component {
	render() {
		return (
			<ProductCard
				title="Jetpack Backup Daily"
				subtitle="Purchased 2019-09-13"
				description="Looking for more? With Real-time backups we save as you edit and you’ll get unlimited backup archives"
			>
				<ProductCardPromoNudge
					badgeText="Up to 70% off!"
					text={
						<Fragment>
							Hurry, these are <strong>Limited time introductory prices!</strong>
						</Fragment>
					}
				/>
			</ProductCard>
		);
	}
}
```

### `<ProductCardPromoNudge />` Props

The following props can be passed to the Product Card Promo Nudge component:

- `badgeText`: ( string ) Copy shown inside the promo badge (a green star sticker)
- `text`: ( string | element | node ) Promo text. Looks best if a `<strong>` element is used inside. It can be a string,
  a node or a React element (e.g. `<Fragment>`)

## `ProductCardOptions`

Product Card Options is a Product Card's sub-component for rendering purchase options inside the card. It's meant to
be passed to the Product Card as a child component.

### How to use the `<ProductCardOptions />`

```jsx
import React, { useState } from 'react';
import ProductCard from 'calypso/components/product-card';
import ProductCardOptions from 'calypso/components/product-card/options';

export default function () {
	const [ selectedProductOption, selectProductOption ] = useState(
		'jetpack_backup_realtime_monthly'
	);

	return (
		<ProductCard
			title="Jetpack Backup"
			billingTimeFrame="per month"
			fullPrice={ [ 16, 25 ] }
			discountedPrice={ [ 12, 16 ] }
			description="Always-on backups ensure you never lose your site. Choose from real-time or daily backups."
		>
			<ProductCardOptions
				optionsLabel="Backup options:"
				options={ [
					{
						billingTimeFrame: 'per month',
						discountedPrice: 12,
						fullPrice: 14,
						slug: 'jetpack_backup_daily_monthly',
						title: 'Daily Backups',
					},
					{
						billingTimeFrame: 'per month',
						fullPrice: 25,
						slug: 'jetpack_backup_realtime_monthly',
						title: 'Real-Time Backups',
					},
				] }
				selectedSlug={ selectedProductOption }
				handleSelect={ ( slug ) => selectProductOption( slug ) }
			/>
		</ProductCard>
	);
}
```

### `<ProductCardOptions />` Props

The following props can be passed to the Product Card Options component:

- `handleSelect`: ( func ) Handler function for option selection. A product option `slug` is passed as an argument to
  the handler function
- `options`: ( array ) List of product options to render Each option should be an object. The shape of an option
  object is as follows:
  - `options.billingTimeFrame`: ( string ) Billing time frame label
  - `options.currencyCode`: ( string ) Currency code
  - `options.discountedPrice`: ( number | array ) Discounted price of a product option. If an array of 2 numbers is
    passed, it will be displayed as a price range
  - `options.fullPrice`: ( number | array ) Full price of a product option. If an array of 2 numbers is passed, it
    will be displayed as a price range
  - `options.title`: ( string | element ) Product option title. It can be a string or a React element
    (e.g. `<Fragment>`)
  - `options.slug`: ( string ) Option slug
- `optionsLabel`: ( string ) Label that is displayed above the list of product options
- `selectedSlug`: ( string ) Currently selected product option slug
- `forceRadiosEvenIfOnlyOneOption`: (bool) Normally if there is only one option the display is simplified, but
  setting this to `true` overrides that and uses the full display with radio buttons

## `ProductCardAction`

Product Card Action is a Product Card's sub-component for rendering action section. It consists of an intro
text (optional) and a button.

### How to use the `<ProductCardAction />`

```jsx
import React from 'react';
import ProductCard from 'calypso/components/product-card';
import ProductCardAction from 'calypso/components/product-card/action';

export default class extends React.Component {
	render() {
		return (
			<ProductCard
				title="Jetpack Backup Daily"
				subtitle="Purchased 2019-09-13"
				description="Looking for more? With Real-time backups we save as you edit and you’ll get unlimited backup archives"
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

- `intro`: ( string | element | node ) Intro text to be displayed above the action button. It can be a string, a node or a React element (e.g. `<Fragment>`)
- `label`: ( string ) Action button text
- `onClick`: ( func ) Action button click event handler
- `href`: ( string ) Url that the button click will take you to
- `primary`: ( bool ) If we the action should be primary (default true)
