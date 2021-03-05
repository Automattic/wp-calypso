# Ellipsis Menu

A React component for displaying a toggle menu. By default, only an ellipsis button is rendered which, when clicked, toggles the menu's visibility.

## Usage

Render `<EllipsisMenu />` in a similar fashion as you would [the `<PopoverMenu />` component](../popover-menu), as it is effectively a convenience wrapper for this component with a few additional options. Specifically, you'll still need to render `<PopoverMenuItem />` as children of the `<EllipsisMenu />`.

```jsx
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';

export default function MyComponent( { onMenuItemClick } ) {
	return (
		<EllipsisMenu>
			<PopoverMenuItem onClick={ onMenuItemClick }>Click Me!</PopoverMenuItem>
		</EllipsisMenu>
	);
}
```

## Props

| property      | type           | required | default | comment                                                                                                                                             |
| ------------- | -------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onClick`     | Function       | no       | noop    | Callback that will be invoked when menu button is clicked. Will be passed the click event.                                                          |
| `onToggle`    | Function       | no       | noop    | Callback that will be invoked when menu is toggled. Will be passed the boolean visibility of the menu.                                              |
| `toggleTitle` | String         | no       | `null`  | Override for the default "Toggle menu" `title` attribute on the toggle button.                                                                      |
| `position`    | String         | no       | `null`  | The position at which the menu should be rendered. If omitted, uses the default `position` from [the `<PopoverMenu />` component](../popover-menu). |
| `children`    | PropTypes.node | no       | `null`  | Menu children to be rendered.                                                                                                                       |
| `disabled`    | PropTypes.bool | no       | `null`  | If `true`, then the menu icon will be displayed in light gray and will not be clickable.                                                            |
