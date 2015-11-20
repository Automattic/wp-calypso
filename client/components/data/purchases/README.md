PurchasesData
=============

PurchasesData is a controller-view React component that fetches purchases for the current user and passes the data into a child component.

## Usage

Pass a component through the `component` prop of `<PurchasesData />`. `PurchasesData` will pass data to the given `component` prop, which is mounted as a child.

```js
import React from 'react';
import PurchasesData from 'components/data/purchases';
import MyChildComponent from 'components/my-child-component';

const MyComponent = React.createClass( {
	render() {
		return (
			<PurchasesData component={ MyChildComponent } />
		);
	}
} );

export default MyComponent;
```

The child component should expect to receive any props defined during the render, as well as the `purchases` prop, which is the result of a call to `PurchasesStore.getByUser` for the current user, and is updated whenever `PurchasesStore` changes.
