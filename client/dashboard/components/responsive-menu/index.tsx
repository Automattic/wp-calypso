import { DropdownMenu } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { menu } from '@wordpress/icons';
import React from 'react';
import Menu from '../menu';
import RouterLinkMenuItem from '../router-link-menu-item';
import type { ActiveOptions } from '@tanstack/react-router';

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
							const { to, children: itemChildren } = child.props;
							return (
								<RouterLinkMenuItem to={ to } onClick={ onClose }>
									{ itemChildren }
								</RouterLinkMenuItem>
							);
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
	props: {
		to: string;
		children: React.ReactNode;
		activeOptions?: ActiveOptions;
	}
) {
	// This is going to be replaced with the right menu item depending on the screen size.
	return null;
};

export default ResponsiveMenu;
