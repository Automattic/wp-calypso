Ellipsis Menu
=============

A React component for displaying a toggle menu. By default, only an ellipsis button is rendered which, when clicked, toggles the menu's visibility.

## Usage

Render `<EllipsisMenu />` in a similar fashion as you would [the `<PopoverMenu />` component](../popover-menu), as it is effectively a convenience wrapper for this component with a few additional options. Specifically, you'll still need to render `<PopoverMenuItem />` as children of the `<EllipsisMenu />`.

```jsx
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';

export default function MyComponent( { onMenuItemClick } ) {
	return (
		<EllipsisMenu>
			<PopoverMenuItem onClick={ onMenuItemClick }>
				Click Me!
			</PopoverMenuItem>
		</EllipsisMenu>
	);
}
```

## Props

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
	<tr><td>Default</td><td><code>null</code></td></tr>
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
