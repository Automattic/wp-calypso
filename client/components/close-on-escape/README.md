# Close on Escape

Allows for an ordered stack of components that carry out an action when the <kbd>esc</kbd> key is pressed. Each instance will carry out their `onEscape` action before being removed from the stack on a first-in-last-out basis.

This is useful for components such as `<Dialog />` and `<Popover />`, particularly in flows that see multiple `Dialog`s that 'stack'.

## Usage

To use this component, either nest it inside of an existing component or as a sibling, passing it a function as `onEscape` to be called when <kbd>esc</kbd> is pressed.

```jsx
import CloseOnEscape from 'calypso/components/close-on-escape';

function closeDialog() {
	// Take care of closing this component
}

function render() {
	// Nested:

	return (
		<Dialog>
			<CloseOnEscape onEscape={ this.closeDialog } />
		</Dialog>
	);

	// Or as a sibling:
	/*
	return (
		<div>
			<CloseOnEscape onEscape={ this.closeDialog } />
			<Dialog />
		</div>
	);
	*/
}
```

## Props

### `onEscape`

<table>
	<tr><td>Type</td><td>function</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>noop</code></td></tr>
</table>

The function to be called when <kbd>esc</kbd> is pressed.
