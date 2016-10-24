Segmented Control
=================

React component used to display a "segmented control".

![Segmented Control example](https://cldup.com/5q6rA4FtMz.png)

It can be utilized via two different techniques: children components or an options array. These techniques are available because certain use cases prefer the "selection" logic to be built into `SegmentedControl`, while others prefer to explicitly define that logic elsewhere.

---

## Using Children

The children technique is appropriate when you'd like to define the "selection" logic at the same point where `<SegmentedControl>` is implemented.

A good example for this case is navigation. Sometimes the option that is selected is defined by the route, other times it's a state value, external prop, etc.

```js
var SegmentedControl = require( 'components/segmented-control' ),
	ControlItem = require( 'components/segmented-control/item' );

module.exports = React.createClass( {

	// ...

	render: function() {
		return (
			<SegmentedControl>
				<ControlItem
					selected={ this.state.selected === 'all' }
					onClick={ this.handleFilterClick( 'all' ) }
				>
					All
				</ControlItem>

				<ControlItem
					selected={ this.state.selected === 'unread' }
					onClick={ this.handleFilterClick( 'unread' ) }
				>
					Unread
				</ControlItem>

				<ControlItem
					selected={ this.state.selected === 'comments' }
					onClick={ this.handleFilterClick( 'comments' ) }
				>
					Comments
				</ControlItem>

				<ControlItem
					selected={ this.state.selected === 'follows' }
					onClick={ this.handleFilterClick( 'follows' ) }
				>
					Follows
				</ControlItem>

				<ControlItem
					selected={ this.state.selected === 'likes' }
					onClick={ this.handleFilterClick( 'likes' ) }
				>
					Likes
				</ControlItem>
			</SegmentedControl>
		);
	},

	handleFilterClick: function( value ) {
		return function() {

			// ... (track analytics, add to state, etc.)

			this.setState( {
				selected: value
				// ...
			} );
		}.bind( this );
	}
} );
```

The key here is that it's up to the parent component to explicitly define things like: which item is selected, and potentially `onClick` callbacks, etc.

### Props

#### Segmented Control

`className`

Optional extra class(es) to be applied to the `.segmented-control`.

`style`

Optional extra styles to be applied to the main element. See React's [documentation](https://facebook.github.io/react/tips/inline-styles.html) on inline styles for reference.

`compact`

Optional variant of a more visually compact segmented control.

#### Control Item

`selected`

Boolean representing the selected visual state. `selected={ true }` creates a blue background on the selected item.

![selected example screenshot](https://cldup.com/c6RXnmdkHe.png)

`path`

Optional URL to navigate to when option is clicked.

`title`

Optional title to show when hovering over segmented control options.

`onClick`

Optional callback that will be applied when a `ControlItem` has been clicked. This could be used for updating a parent's state, tracking analytics, etc.

---

## Using options array

`SegmentedControl` can also be used by passing in an `options` array as a prop. This technique is great for situations where you don't want to explicitly define things like what happens when an item is clicked or which item is currently selected, etc.

A good example for this case is a form element. You don't want to have to write the logic for updating the component when a new selection is made, but you might want to hook into certain events like: when a new selection is made, what was the option?

> **NOTE** - there is still more work here in order to be fully functional as a form element, not recommended use case... yet.

```js
var SegmentedControl = require( 'components/segmented-control' );
var options = [
	{ value: 'all', label: 'All' },
	{ value: 'unread', label: 'Unread' },
	{ value: 'comments', label: 'Comments' },
	{ value: 'follows', label: 'Follows' },
	{ value: 'likes', label: 'Likes' }
];

module.exports = React.createClass( {

	// ...

	render: function() {
		return (
			<SegmentedControl options={ options } onSelect={ this.handleOnSelect } />
		);
	},

	handleOnSelect: function( option ) {
		console.log( 'selected option:', option ); // full object of selected option
	}

} );
```

Note that all the "selection" logic will be applied in `SegmentedControl` itself using a simple `selected` value comparison in state. It will update itself when an option has been clicked.

### Props

`options`

The main data set for rendering out the various options.

```js
var options = [
	{
		value: // *required* - (string) tracked by component
		label: // *required* - (string) displayed to user
		path: // optional - (string) URL to navigate when clicked
	},
	// ...
];
```

`initialSelected`

Optional string representing the initial selected option's `value`. Default will be the first option's `value`.

`onSelect`

Optional callback that will be run whenever a new selection has been clicked.
