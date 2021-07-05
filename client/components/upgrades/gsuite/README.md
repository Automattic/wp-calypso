# GSuiteUpgrade

GSuiteUpgrade is a React component used to add G Suite email addresses to domains. It expects to be wrapped in a `ShoppingCartProvider` Component.

## Usage

```jsx
import React from 'react';
import GSuiteUpgrade from 'calypso/components/upgrades/gsuite';
import productsListFactory from 'calypso/lib/products-list';

const productsList = productsListFactory();

function MyComponent() {
	return <GSuiteUpgrade domain={ domain } />;
}
```
