# Pass to Children

Pass to Children is a utility method to assist in creating a React pass-through component. A common pattern in React is to create [controller-views](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views) which themselves render nothing, but inject and pass along props to a child or set of children.

## Usage

The exposed method expects to receive the current react element instance, and an object of props to pass to the child in addition to the props of the instance itself.

```js
import React from 'react';
import passToChildren from 'calypso/lib/react-pass-to-children';

export default class extends React.Component {
	render() {
		return passToChildren( this, {
			data: [ 1, 2, 3 ],
		} );
	}
}
```
