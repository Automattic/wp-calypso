import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import React from 'react';
import type {
	Props as MenuProps,
	ItemProps,
	TriggerButtonProps,
	PopoverProps,
	GroupProps,
	GroupLabelProps,
	RadioItemProps,
	CheckboxItemProps,
	SeparatorProps,
	ContextProps,
} from '@wordpress/components/src/menu/types';

// TODO: When the component is publicly available, we should remove the private API usage and
// import it directly from @wordpress/components as it will cause a build error.
const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { Menu: CoreMenu } = unlock( privateApis );

/**
 * A wrapper component around WordPress's private [`Menu` component](https://wordpress.github.io/gutenberg/?path=/docs/components-menu--docs)
 * from `@wordpress/components`.
 *
 * ```jsx
 * import { Menu } from '@automattic/components';
 * import { useState } from 'react';
 *
 * function MyComponent() {
 * 	const [ isChecked, setIsChecked ] = useState( false );
 * 	return (
 * 		<Menu trigger={ <Menu.TriggerButton>Open Menu</Menu.TriggerButton> }>
 * 			<Menu.Popover>
 * 				<Menu.Group>
 * 					<Menu.Item onClick={ () => console.log( 'Item 1 clicked' ) }>Menu Item 1</Menu.Item>
 * 					<Menu.Separator />
 * 					<Menu.CheckboxItem checked={ isChecked } onChange={ () => setIsChecked( ! isChecked ) }>
 * 						Checkbox Item
 * 					</Menu.CheckboxItem>
 * 				</Menu.Group>
 * 			</Menu.Popover>
 * 		</Menu>
 * 	);
 * }
 * ```
 */
const Menu = ( props: MenuProps & React.HTMLAttributes< HTMLDivElement > ) => {
	return <CoreMenu { ...props } />;
};

/**
 * Menu is a collection of React components that combine to render
 * ARIA-compliant [menu](https://www.w3.org/WAI/ARIA/apg/patterns/menu/) and
 * [menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/) patterns.
 *
 * `Menu` itself is a wrapper component and context provider.
 * It is responsible for managing the state of the menu and its items, and for
 * rendering the `Menu.TriggerButton` (or the `Menu.SubmenuTriggerItem`)
 * component, and the `Menu.Popover` component.
 *
 * We need to attach these components to the `Menu` object so that we can use them
 * in the same way as the `@wordpress/components` package.
 */
Menu.Item = CoreMenu.Item as React.FC< ItemProps >;
Menu.RadioItem = CoreMenu.RadioItem as React.FC< RadioItemProps >;
Menu.CheckboxItem = CoreMenu.CheckboxItem as React.FC< CheckboxItemProps >;
Menu.ItemLabel = CoreMenu.ItemLabel;
Menu.ItemHelpText = CoreMenu.ItemHelpText;
Menu.Group = CoreMenu.Group as React.FC< GroupProps >;
Menu.GroupLabel = CoreMenu.GroupLabel as React.FC< GroupLabelProps >;
Menu.Separator = CoreMenu.Separator as React.FC< SeparatorProps >;
Menu.Popover = CoreMenu.Popover as React.FC< PopoverProps >;
Menu.TriggerButton = CoreMenu.TriggerButton as React.FC< TriggerButtonProps >;
Menu.SubmenuTriggerItem = CoreMenu.SubmenuTriggerItem as React.FC< ItemProps >;
Menu.Context = CoreMenu.Context as React.Context< ContextProps >;

export default Menu;
