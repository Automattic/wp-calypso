# PlanPrice Component

The PlanPrice component is a React component used to display a plan's price with a currency and a discount, if any. It can be used anywhere where a plan's price is required.

If you want to emphasize that a plan's price is discounted, use two `<PlanPrice>` components as below and wrap them in a
flexbox container.

## Usage

PlanPrice can take a `productDisplayPrice` or a `rawPrice` prop.

A `productDisplayPrice` can be retrieved from the `/purchases` or `/plans` REST endpoints and are stored in Redux; for example:

```jsx
function MyComponent( { purchaseId } ) {
	const { productDisplayPrice } = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );
	return <PlanPrice productDisplayPrice={ productDisplayPrice } />;
}
```

```jsx
<PlanPrice
	productDisplayPrice={ purchase.productDisplayPrice }
	taxText={ purchase.taxText }
	isOnSale={ !! purchase.saleAmount }
/>;
```

```jsx
<PlanPrice
	productDisplayPrice={ purchase.productDisplayPrice }
	rawPrice={ getRenewalPrice( purchase ) }
	currencyCode={ purchase.currencyCode }
	taxText={ purchase.taxText }
	isOnSale={ !! purchase.saleAmount }
/>;
```

If you pass an array of two numbers in the `rawPrice` prop, a range of prices will be displayed.

```jsx
import { PlanPrice } from '@automattic/components';

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
