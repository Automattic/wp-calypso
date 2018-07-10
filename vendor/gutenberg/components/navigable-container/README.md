NavigableContainers
=============

`NavigableContainer` is a React component to render a container navigable using the keyboard. Only things that are focusable can be navigated to. It will currently always be a `div`.

`NavigableContainer` is exported as two classes: `NavigableMenu` and `TabbableContainer`. `NavigableContainer` itself is **not** exported. `NavigableMenu` and `TabbableContainer` have the props listed below. Any other props will be passed through to the `div`.

----

## Props

These are the props that `NavigableMenu` and `TabbableContainer`. Any props which are specific to one class are labelled appropriately.

### onNavigate

A callback invoked when the menu navigates to one of its children passing the index and child as an argument

- Type: `Function`
- Required: No

### cycle

A boolean which tells the component whether or not to cycle from the end back to the beginning and vice versa.

- Type: `Boolean`
- Required: No
- default: true

### orientation (NavigableMenu only)

The orientation of the menu. It could be "vertical", "horizontal" or "both"

- Type: `String`
- Required: No
- Default: `"vertical"`

## Classes

### NavigableMenu


A NavigableMenu allows movement up and down (or left and right) the component via the arrow keys. The `tab` key is not handled. The `orientation` prop is used to determine whether the arrow keys used are vertical, horizontal or both.

### Usage

```jsx
import { NavigableMenu, Button } from '@wordpress/components';

function onNavigate( index, target ) {
	// ....
}

function MyMenu() {
	return (
		<NavigableMenu onNavigate={ onNavigate }>
			<Button>My Button 1</Button>
			<Button>My Button 2</Button>
			<Button>My Button 3</Button>
		</NavigableMenu>
	);
}
```

### TabbableContainer

A `TabbableContainer` will only be navigated using the `tab` key. Every intended tabstop must have a tabIndex `0`.

### Usage

```jsx
import { TabbableContainer, Button } from '@wordpress/components';

function onNavigate( index, target ) {
	// ....
}

function MyContainer() {
	return (
		<TabbableContainer onNavigate={ onNavigate }>
			<div tabIndex="0">Section 1</div>
			<div tabIndex="0">Section 2</div>
			<div tabIndex="0">Section 3</div>
			<div tabIndex="0">Section 4</div>
		</TabbableContainer>
	);
}
```
