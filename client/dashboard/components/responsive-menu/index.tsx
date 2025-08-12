import { DropdownMenu } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { menu } from '@wordpress/icons';
import React, { type ComponentProps } from 'react';
import Menu from '../menu';
import RouterLinkMenuItem from '../router-link-menu-item';

type ResponsiveMenuProps = {
	children: React.ReactNode;
	icon?: React.ReactElement;
	label?: string;
	dropdownPlacement?: 'bottom-end' | 'bottom-start' | 'bottom';
};

function ResponsiveMenu( {
	children,
	icon = menu,
	label = 'Menu',
	dropdownPlacement = 'bottom-end',
}: ResponsiveMenuProps ) {
	const isDesktop = useViewportMatch( 'medium' );

	if ( isDesktop ) {
		return (
			<Menu>
				{ React.Children.map( children, ( child ) => {
					if ( React.isValidElement( child ) && child.type === ResponsiveMenu.Item ) {
						return <Menu.Item { ...child.props } />;
					}
					return child;
				} ) }
			</Menu>
		);
	}

	return (
		<DropdownMenu
			icon={ icon }
			label={ label }
			popoverProps={ {
				placement: dropdownPlacement,
			} }
		>
			{ ( { onClose } ) => (
				<>
					{ React.Children.map( children, ( child ) => {
						if ( React.isValidElement( child ) && child.type === ResponsiveMenu.Item ) {
							return <RouterLinkMenuItem onClick={ onClose } { ...child.props } />;
						}
						return child;
					} ) }
				</>
			) }
		</DropdownMenu>
	);
}

ResponsiveMenu.Item = function MenuItem(
	// eslint-disable-next-line -- The props are not used because this is just a placeholder component.
	props: ComponentProps< typeof RouterLinkMenuItem >
) {
	// This is going to be replaced with the right menu item depending on the screen size.
	return null;
};

export default ResponsiveMenu;
