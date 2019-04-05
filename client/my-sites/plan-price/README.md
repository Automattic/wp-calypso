PlanPrice Component
=============

PlanPrice component is a React component used to display plan's price with a currency and a discount, if any.
It can be used anywhere where a plan's price is required.

If you want to emphasize that a plan's price is discounted, use two `<PlanPrice>` components as below and wrap them in a
flexbox container.

## Usage

```jsx
import PlanPrice from 'my-sites/plan-price';

export default class extends React.Component {
	static displayName = 'MyPlanPrice';

	render() {
		return (
			<span className="my-plan-price-with-flexbox">
				<PlanPrice rawPrice={ 99 } original />
				<PlanPrice rawPrice={ 30 } discounted />
			</span>
		);
	}
}
```

## Props

| Prop         | Type   | Description                                               |
| ----         | -------| -----------                                               |
| rawPrice     | number | Price of the plan                                         |
| original     | bool   | Is the price discounted and this is the original one?     |
| discounted   | bool   | Is the price discounted and this is the discounted one?   |
| isOnSale     | bool   | Is the product this price is for on sale?                 |
| currencyCode | string | Currency of the price                                     |
| className    | string | If you need to add additional classes                     |

