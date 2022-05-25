# PlanPrice Component

The PlanPrice component is a React component used to display a plan's price with a currency and a discount, if any. It can be used anywhere where a plan's price is required.

If you want to emphasize that a plan's price is discounted, use two `<PlanPrice>` components as below and wrap them in a
flexbox container.

## Usage

PlanPrice can take a `productDisplayPrice` or a `rawPrice`  (deprecated) prop, though `productDisplayPrice` is the preferred option.

A `productDisplayPrice` can be passed from the `/purchases` or `/plans` REST endpoints to a Redux store, for example:

```jsx
	import { connect } from 'react-redux';

	const { productDisplayPrice } = purchase;

	export default connect( ( state, props ) => {
		const purchase = getByPurchaseId( state, props.purchaseId );
		...more props
		return {
			purchase,
			...more props,
		}
	});
```
`productDisplayPrice` is preferred because it provides an HTML wrapped, geo-IDed, and properly formatted currency string. Whereas, `rawPrice` is not geo-IDed and requires extra work to format correctly on the front end.

You can pass along `rawPrice` (not required) with `productDisplayPrice` and when available the `productDisplayPrice` will be used by default.

**Preferred usage**
```jsx
<PlanPrice
	productDisplayPrice={ purchase.productDisplayPrice }
	taxText={ purchase.taxText }
	isOnSale={ !! purchase.saleAmount }
/>
```

**Backwards compatible usage**
```jsx
<PlanPrice
	productDisplayPrice={ purchase.productDisplayPrice }
	rawPrice={ getRenewalPrice( purchase ) }
	currencyCode={ purchase.currencyCode }
	taxText={ purchase.taxText }
	isOnSale={ !! purchase.saleAmount }
/>
```

If you pass an array of two numbers in the `rawPrice` prop, a range of prices will be displayed.


```jsx
import PlanPrice from 'calypso/my-sites/plan-price';

export default class extends React.Component {
	static displayName = 'MyPlanPrice';

	render() {
		return (
			<div>
				<span className="my-plan-price-with-flexbox">
					<PlanPrice rawPrice={ 99 } original />
					<PlanPrice rawPrice={ 30 } discounted />
				</span>
				<span className="my-plan-price-with-flexbox">
					<PlanPrice rawPrice={ [ 132.2, 110.4 ] } original />
					<PlanPrice rawPrice={ [ 99.99, 87 ] } discounted />
				</span>
			</div>
		);
	}
}
```

## Props

| Prop         | Type           | Description                                             |
| ------------------- | -------------- | ------------------------------------------------------- |
| productDisplayPrice | number         | HTML wrapped display price                              |
| rawPrice            | number / array | Price or price range of the plan                        |
| original            | bool           | Is the price discounted and this is the original one?   |
| discounted          | bool           | Is the price discounted and this is the discounted one? |
| isOnSale            | bool           | Is the product this price is for on sale?               |
| currencyCode        | string         | Currency of the price                                   |
| className           | string         | If you need to add additional classes                   |
