# SortableList

SortableList is a React component to enable device-friendly item rearranging. For non-touch devices, child elements of SortableList can be rearranged by drag-and-drop. On touch devices, the user must tap an item to activate it before rearranging via one of two directional button controls.

## Desktop

![Desktop](https://cldup.com/kcSdY87WOC.gif)

## Touch

![Touch](https://cldup.com/G6xOcADYAl.gif)

## Usage

Below is example usage for rendering an SortableList:

```jsx
<SortableList>
	<button className="button">First</button>
	<button className="button">Second</button>
</SortableList>;
```

In traditional React fashion, a SortableList does not track its own state, but instead expects you as the developer to track changes through an `onChange` handler, re-rendering the component with the updated element ordering. Refer to the following example:

```jsx
import React, { Component } from 'react';
import SortableList from 'calypso/components/forms/sortable-list';

class MyComponent extends Component {
	state = {
		items: [ 'First', 'Second', 'Third' ],
	};

	onChange = ( order ) => {
		const items = [];

		this.state.items.forEach( function ( item, i ) {
			items[ order[ i ] ] = item;
		}, this );

		this.setState( {
			items: items,
		} );
	};

	render() {
		const items = this.state.items.map( function ( item ) {
			return <button className="button">{ item }</button>;
		} );

		return <SortableList onChange={ onChange }>{ items }</SortableList>;
	}
}
```

## Props

### `direction`

Accepts either "horizontal" (default) or "vertical". A horizontal SortableList is rendered from left to right and can wrap. A vertical SortableList is rendered from top to bottom.

### `allowDrag`

If dragging is not desired in any device context, pass an `allowDrag` value of `false`. Defaults to `true`.

### `onChange`

A change handler to invoke when the user has modified the ordering of elements. This function is passed a single array argument. Each index of the array aligns the original element ordering, and the value represents the element's new position on a zero-based index. Using the example above as a reference, if a user were to move "First" to be the second element in the list, you could expect an `onChange` argument of `[ 1, 0, 2 ]`.
