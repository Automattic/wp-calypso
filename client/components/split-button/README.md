# Split Button

A React component for displaying a button with a labeled main action plus a secondary, identified by a chevron, that toggles the menu's visibility.

## Usage

Render `<SplitButton />` in a similar fashion as you would [the `<PopoverMenu />` component](../popover-menu), as it is effectively a convenience wrapper for this component with a few additional options. Specifically, you'll still need to render `<PopoverMenuItem />` as children of the `<SplitButton />`.

```jsx
import SplitButton from 'calypso/components/split-button';
import PopoverMenuItem from 'calypso/components/popover/menu-item';

export default function MyComponent( { onMenuItemClick } ) {
	return (
		<SplitButton mainFace="Split Button">
			<PopoverMenuItem onClick={ onMenuItemClick }>Click Me!</PopoverMenuItem>
		</SplitButton>
	);
}
```

## Props

### `mainFace`

<table>
	<tr><td>Type</td><td><code>PropTypes.node</code></td></tr>
    <tr><td>Required</td><td>Yes</td></tr>
	<tr><td>Default</td><td><code>noop</code></td></tr>
</table>

Text or icon for the main button.

### `compact`

<table>
	<tr><td>Type</td><td><code>PropTypes.bool</code></td></tr>
    <tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>false</code></td></tr>
</table>

Whether the button is compact or not.

### `primary`

<table>
	<tr><td>Type</td><td><code>PropTypes.bool</code></td></tr>
    <tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>false</code></td></tr>
</table>

Whether the button is styled as a primary button.

### `scary`

<table>
	<tr><td>Type</td><td><code>PropTypes.bool</code></td></tr>
    <tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>false</code></td></tr>
</table>

Whether the button has modified styling to warn users (delete, remove, etc).es

### `onClick`

<table>
	<tr><td>Type</td><td>Function</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>noop</code></td></tr>
</table>

Callback that will be invoked when menu button is clicked.
Will be passed the click event.

### `onToggle`

<table>
	<tr><td>Type</td><td>Function</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>noop</code></td></tr>
</table>

Callback that will be invoked when menu is toggled.
Will be passed the boolean visibility of the menu.

### `toggleTitle`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>null</code></td></tr>
</table>

Override for the default "Toggle menu" `title` attribute on the toggle button.

### `position`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>bottom left</code></td></tr>
</table>

The position at which the menu should be rendered. If omitted, uses the default `position` from [the `<PopoverMenu />` component](../popover-menu).

### `children`

<table>
	<tr><td>Type</td><td><code>PropTypes.node</code></td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>null</code></td></tr>
</table>

Menu children to be rendered.

### `disabled`

<table>
	<tr><td>Type</td><td><code>PropTypes.bool</code></td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>null</code></td></tr>
</table>

If `true`, then the menu icon will be displayed in light gray and will not be clickable.
