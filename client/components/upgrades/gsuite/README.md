# GSuiteUpgrade

GSuiteUpgrade is a React component used to add G Suite email addresses to domains. It expects to be wrapped in a `ShoppingCartProvider` Component.

## Usage

```jsx
import React from 'react';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import GSuiteUpgrade from 'calypso/components/upgrades/gsuite';
import productsListFactory from 'calypso/lib/products-list';

const productsList = productsListFactory();

class MyComponent extends React.Component {
	render() {
		return (
			<CalypsoShoppingCartProvider>
				<GSuiteUpgrade domain={ domain } />;
			</CalypsoShoppingCartProvider>
		);
	}
}
```
