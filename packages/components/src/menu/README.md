# Menu Component

A wrapper component around WordPress's private [`Menu` component](https://wordpress.github.io/gutenberg/?path=/docs/components-menu--docs) from `@wordpress/components`.

## Usage

```jsx
import { Menu } from '@automattic/components';
import { useState } from 'react';

function MyComponent() {
	const [ isChecked, setIsChecked ] = useState( false );
	return (
		<Menu trigger={ <Menu.TriggerButton>Open Menu</Menu.TriggerButton> }>
			<Menu.Popover>
				<Menu.Group>
					<Menu.Item onClick={ () => console.log( 'Item 1 clicked' ) }>Menu Item 1</Menu.Item>
					<Menu.Separator />
					<Menu.CheckboxItem checked={ isChecked } onChange={ () => setIsChecked( ! isChecked ) }>
						Checkbox Item
					</Menu.CheckboxItem>
				</Menu.Group>
			</Menu.Popover>
		</Menu>
	);
}
```

## Available Subcomponents

The Menu component includes all the original subcomponents from the Gutenberg Menu implementation:

- `Menu.Item` - A basic menu item
- `Menu.RadioItem` - A radio button menu item
- `Menu.CheckboxItem` - A checkbox menu item
- `Menu.ItemLabel` - A label for a menu item
- `Menu.ItemHelpText` - Help text for a menu item
- `Menu.Group` - A group of menu items
- `Menu.GroupLabel` - A label for a group of menu items
- `Menu.Separator` - A separator line between menu items
- `Menu.Popover` - The popover component that contains the menu
- `Menu.TriggerButton` - The button that triggers the menu
- `Menu.SubmenuTriggerItem` - A menu item that triggers a submenu
- `Menu.Context` - React context for the menu

## Important Notes

### Private API Usage

This component currently uses WordPress's private API through `@wordpress/private-apis`. The underlying `Menu` component is not yet part of the public API and may change or break in future versions of WordPress.

We will migrate to the public version of this component once it becomes available in `@wordpress/components`.

### Why a Wrapper?

1. **Centralized Private API Management**: Without this wrapper, we would need to duplicate the private API acknowledgment code everywhere the Menu is used. This wrapper centralizes the code in one place and makes it easier to track its usage.

2. **Future-Proofing**: When the Menu component becomes public, we'll only need to update this one wrapper component instead of finding and updating every direct usage throughout the codebase. This makes the eventual migration to the public API much simpler.

## Future Plans

Once the Menu component becomes publicly available in `@wordpress/components`, we should:

1. Remove the private API usage
2. Update this wrapper to use the public API
3. Eventually consider deprecating this wrapper in favor of direct Menu usage
