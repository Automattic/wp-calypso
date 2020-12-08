# Segmented Control

Segmented Control manipulates the content shown following an exclusive or “either/or” pattern.

## Usage

It can be utilized via two different techniques: **child components** or an **options array**. These techniques are available because certain use cases prefer the "selection" logic to be built into `SegmentedControl`, while others prefer to explicitly define that logic elsewhere.

### Child components

The children technique is appropriate when you'd like to define the "selection" logic at the same point where `<SegmentedControl>` is implemented.

A good example for this case is navigation. Sometimes the option that is selected is defined by the route, other times it's a state value, external prop, etc.

```jsx
import React from 'react';
import SegmentedControl from 'calypso/components/segmented-control';

export default class extends React.Component {
	// ...

	render() {
		return (
			<SegmentedControl>
				<SegmentedControl.Item
					selected={ this.state.selected === 'all' }
					onClick={ this.handleFilterClick( 'all' ) }
				>
					All
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ this.state.selected === 'unread' }
					onClick={ this.handleFilterClick( 'unread' ) }
				>
					Unread
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ this.state.selected === 'comments' }
					onClick={ this.handleFilterClick( 'comments' ) }
				>
					Comments
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ this.state.selected === 'follows' }
					onClick={ this.handleFilterClick( 'follows' ) }
				>
					Follows
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ this.state.selected === 'likes' }
					onClick={ this.handleFilterClick( 'likes' ) }
				>
					Likes
				</SegmentedControl.Item>
			</SegmentedControl>
		);
	}

	handleFilterClick( value ) {
		return function () {
			// ... (track analytics, add to state, etc.)

			this.setState( {
				selected: value,
				// ...
			} );
		}.bind( this );
	}
}
```

The key here is that it's up to the parent component to explicitly define things such as the selected item, potential `onClick` callbacks, etc.

#### Props

##### Segmented Control

| Name        | Type     | Default | Description                               |
| ----------- | -------- | ------- | ----------------------------------------- |
| `className` | `string` | `0`     | Class(es) applied to `.segmented-control` |
| `style`     | `string` | `0`     | Inline styles applied to the main element |
| `compact`   | `bool`   | `false` | Decreases the size                        |

##### Control Item

| Name         | Type     | Default | Description                                             |
| ------------ | -------- | ------- | ------------------------------------------------------- |
| `selected`\* | `bool`   | `false` | Determines the selected item                            |
| `path`       | `string` | `null`  | URL to navigate to when item is clicked                 |
| `title`      | `string` | `null`  | Title to show when hovering over item                   |
| `onClick`    |          | `null`  | Callback applied when `SegmentedControlItem` is clicked |

### Options array

We also provide `SimplifiedSegmentedControl` which uses an `options` array as a prop. This technique is great for situations where you don't want to explicitly define things like what happens when an item is clicked or which item is currently selected, etc.

A good example for this case is a form element. You don't want to have to write the logic for updating the component when a new selection is made, but you might want to hook into certain events like: when a new selection is made, what was the option?

**NOTE**: _there is still more work here in order to be fully functional as a form element. This is currently experimental._

```jsx
import React from 'react';
import SimplifiedSegmentedControl from 'calypso/components/segmented-control/simplified';

const options = [
	{ value: 'all', label: 'All' },
	{ value: 'unread', label: 'Unread' },
	{ value: 'comments', label: 'Comments' },
	{ value: 'follows', label: 'Follows' },
	{ value: 'likes', label: 'Likes' },
];

export default class extends React.Component {
	// ...

	handleOnSelect = ( option ) => {
		console.log( 'selected option:', option ); // full object of selected option
	};

	render() {
		return <SimplifiedSegmentedControl options={ options } onSelect={ this.handleOnSelect } />;
	}
}
```

Note that all the "selection" logic will be applied in `SimplifiedSegmentedControl` itself using a simple `selected` value comparison in state. It will update itself when an option has been clicked.

#### Props

| Name              | Type     | Default | Description                                      |
| ----------------- | -------- | ------- | ------------------------------------------------ |
| `options`\*       | `array`  | `null`  | The main data set for rendering options          |
| `initialSelected` | `string` | `null`  | Represents the initial selected option's `value` |
| `onSelect`        |          | `null`  | Callback whenever a new item has been clicked    |

##### `options` prop example

```js
const options = [
	{
		value: 'the value', // *required* - (string) tracked by component
		label: 'the label', // *required* - (string) displayed to user
		path: 'a path', // optional - (string) URL to navigate when clicked
	},
	// ...
];
```

### General guidelines

- There are two states: selected and non-selected. There must always be only one selected state, no more, no less.
- The primary style is preferred. Use your best judgement if you want to use the non-primary style to remove visual conflict with another primary elements in the view.
- Text should be concise and specific. Use no more than two words.
- A default selection is required. The default selection is the first option in the segmented control.

## Related components

- To group buttons together, use the [ButtonGroup](./button-group) component.
- To navigate between multiple pages of items, use the [Pagination](./pagination) component.
- To alternate among related views within the same context with _tabs_, use the [SectionNav](./section-nav) component.
