import { __experimentalHStack as HStack, Button, DropdownMenu } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
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
						if ( child.props.target === '_blank' ) {
							return (
								<Button className="dashboard-menu__item" variant="tertiary" { ...child.props }>
									<HStack justify="flex-start" spacing={ 1 }>
										<span>{ child.props.children }</span>
										<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
									</HStack>
								</Button>
							);
						}

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
							if ( child.props.target === '_blank' ) {
								return (
									<Menu.ItemLink { ...child.props }>
										<HStack justify="flex-start" spacing={ 1 }>
											<span>{ child.props.children }</span>
											<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
										</HStack>
									</Menu.ItemLink>
								);
							}

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
