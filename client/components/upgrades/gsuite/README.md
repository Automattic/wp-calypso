# G Suite

G Suite is a React component used to add G Suite email addresses to domains.

## Usage

```jsx
import React from 'react';
import GSuiteUpgrade from 'components/upgrades/gsuite';
import productsListFactory from 'lib/products-list';

const productsList = productsListFactory();

class MyComponent extends React.Component {
	render() {
		return <GSuiteUpgrade domain={ domain } />;
	}
}
```
