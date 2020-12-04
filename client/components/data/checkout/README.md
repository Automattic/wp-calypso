# CheckoutData

`CheckoutData` is a React component intended to be used as a controller-view to simplify binding and interacting with the Flux modules required for the [checkout components](../../../my-sites/upgrades/checkout/).

## Usage

Wrap a child component with `<CheckoutData />`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), `CheckoutData` does not render any content of its own; instead, it simply renders the child component. When mounted, the component will automatically trigger a network request for data if data hasn't yet been retrieved for the site.

```jsx
import React from 'react';
import CheckoutData from 'calypso/components/data/checkout';
import MyChildComponent from './my-child-component';

export default class extends React.component {
	static displayName = 'MyComponent';

	render() {
		return (
			<CheckoutData>
				<MyChildComponent />
			</CheckoutData>
		);
	}
}
```

The child component should expect to receive any props defined during the render.
