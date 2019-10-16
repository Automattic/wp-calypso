Product Card
=======

Product Card is a React component for rendering a box with product short description and purchase options.

It's used e.g. on `my-plans` page near the bundle plans grid and is intended to render a product card (not a regular
plan).

## <a name="how-isPurchased-flag-works"></a>How `isPurchased` flag works

The component can be in two visual and functional states:
* `isPurchased` flag is not set - the product plan prices will be rendered below the highlighted title. If the product
has purchase options, they will be listed below the description.
* `isPurchased` flag is set - the content area will not contain product options (if they exist).

See p1HpG7-7nT-p2 for more details.

## <a name="how-checked-works"></a>How `checked` works

The component header can optionally render and control a checkbox, and supports these cases:
* `checked` is `true` - the checkbox will be rendered as checked.
* `checked` is `false` - the checkbox will be rendered as unchecked.
* `checked` is `null` - the checkbox will be rendered as uncontrolled and will be freely checkable by the user.
* `checked` is `undefined` or not specified - the checkbox will not be rendered.

Additionally, the `onSelect` prop is used if we need an external component to control what happens when the checkbox is (un)checked.

## Usage

```jsx
import React from 'react';
import ProductCard from 'components/product-card';

export default class extends React.Component {
	render() {
		return (
			<ProductCard
				title={ <Fragment>Jetpack Backup <em>Real-Time</em></Fragment> }
				subtitle={ <Fragment>Included in your <a href="/my-plan">Personal Plan</a></Fragment> }
				description="Always-on backups ensure you never lose your site. Your changes are saved as you edit and you have unlimited backup archives"
				isPurchased
			/>
		);
	}
}
```

## Props

The following props can be passed to the Product Card component:

* `billingTimeFrame`: ( string ) Billing time frame label
* `checked`: ( bool ) Whether the header checkbox is checked. [Read more about the way this prop works](#how-checked-works)
* `currencyCode`: ( string ) Currency code
* `description`: ( string | element ) Product description. It can be a string or a React element (e.g. `<Fragment>`)
* `discountedPrice`: ( number | array ) Discounted price of the product. If an array of 2 numbers is passed, it will be
  displayed as a price range
* `fullPrice`: ( number | array ) Full price of the product. If an array of 2 numbers is passed, it will be displayed as
  a price range
* `isPurchased`: ( bool ) Flag indicating if the product has already been purchased. [Read more about the way this flag
  works](#how-isPurchased-flag-works)
* `onSelect`: ( func ) Handle the header checkbox clicks (checking and unchecking the checkbox).
* `subtitle`: ( string | element ) Product subtitle. It's used if the product has already been purchased, but can be
  used also in other use-cases. It can be a string or a React element (e.g. `<Fragment>`)
* `title`: ( string | element ) Product title. It can be a string or a React element (e.g. `<Fragment>`)
