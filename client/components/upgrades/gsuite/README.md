# GSuiteUpgrade

GSuiteUpgrade is a React component used to add G Suite email addresses to domains. It expects to be wrapped in a `CartData` Component.

## Usage

```jsx
import React from 'react';
import CartData from 'calypso/components/data/cart';
import GSuiteUpgrade from 'calypso/components/upgrades/gsuite';
import productsListFactory from 'calypso/lib/products-list';

const productsList = productsListFactory();

class MyComponent extends React.Component {
	render() {
		return (
			<CartData>
				<GSuiteUpgrade domain={ domain } />;
			</CartData>
		);
	}
}
```
