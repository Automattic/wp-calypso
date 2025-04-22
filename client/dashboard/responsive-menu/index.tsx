import { useNavigate, useRouter } from '@tanstack/react-router';
import { DropdownMenu, MenuItem } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { menu } from '@wordpress/icons';
import React from 'react';
import Menu from '../menu';

function MobileMenuItem( {
	to,
	children,
	onClose,
}: {
	to: string;
	children: React.ReactNode;
	onClose: () => void;
} ) {
	const navigate = useNavigate();
	const router = useRouter();
	const href = router.buildLocation( {
		to,
	} ).href;
	const handleClick = ( e: React.MouseEvent ) => {
		e.preventDefault();
		navigate( { to } );
		onClose();
	};

	return (
		<MenuItem
			onClick={ handleClick }
			// @ts-expect-error -- href is supported by MenuItem, the types are not correct.
			href={ href }
		>
			{ children }
		</MenuItem>
	);
}

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
								<MobileMenuItem to={ to } onClose={ onClose }>
									{ itemChildren }
								</MobileMenuItem>
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
	}
) {
	// This is going to be replaced with the right menu item depending on the screen size.
	return null;
};

export default ResponsiveMenu;
