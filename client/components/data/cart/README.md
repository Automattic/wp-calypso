# CartData

`CartData` is a React component intended to be used as a controller-view to simplify binding and interacting with the [cart Flux module](../../../lib/cart/).

## Usage

Wrap a child component with `<CartData />`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), CartData does not render any content of its own; instead, it simply renders the child component. When mounted, the component will automatically trigger a network request for data if data hasn't yet been retrieved for the site.

```jsx
import React from 'react';
import CartData from 'calypso/components/data/cart-data';
import MyChildComponent from './my-child-component';

export default class extends React.Component {
	static displayName = 'MyComponent';

	render() {
		return (
			<CartData>
				<MyChildComponent />
			</CartData>
		);
	}
}
```

The child component should expect to receive any props defined during the render.
