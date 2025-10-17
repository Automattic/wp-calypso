import { __experimentalHStack as HStack, Button, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import React, { useEffect, useRef, useState, type ComponentProps } from 'react';
import Menu from '../menu';
import RouterLinkMenuItem from '../router-link-menu-item';

type ResponsiveMenuProps = {
	prefix?: React.ReactNode;
	children: React.ReactNode;
	icon?: React.ReactElement;
	label?: string;
	dropdownPlacement?: 'bottom-end' | 'bottom-start' | 'bottom';
	forceCollapsed?: boolean;
	onCollapseChange?: ( collapsed: boolean ) => void;
};

function ResponsiveMenu( {
	prefix,
	children,
	icon = menu,
	label = 'Menu',
	dropdownPlacement = 'bottom-end',
	forceCollapsed,
	onCollapseChange,
}: ResponsiveMenuProps ) {
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const measureRef = useRef< HTMLDivElement | null >( null );
	const [ isCollapsed, setIsCollapsed ] = useState( false );

	const checkOverflow = () => {
		const measure = measureRef.current;
		const wrapper = wrapperRef.current;
		if ( ! measure || ! wrapper ) {
			return;
		}

		const containerWidth = wrapper.clientWidth;
		const contentWidth = measure.scrollWidth;
		const collapsed = contentWidth > containerWidth;

		if ( collapsed !== isCollapsed ) {
			setIsCollapsed( collapsed );
			onCollapseChange?.( collapsed );
		}
	};

	useEffect( () => {
		const observer = new ResizeObserver( checkOverflow );
		if ( wrapperRef.current ) {
			observer.observe( wrapperRef.current );
		}
		return () => observer.disconnect();
	}, [ isCollapsed, onCollapseChange ] );

	const inlineMenu = (
		<HStack spacing={ 3 }>
			{ prefix }
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
		</HStack>
	);

	const dropdownMenu = (
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

	if ( forceCollapsed ) {
		return dropdownMenu;
	}

	return (
		<div
			ref={ wrapperRef }
			style={ {
				position: 'relative',
				width: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: isCollapsed ? 'flex-end' : 'flex-start',
			} }
		>
			{ isCollapsed ? dropdownMenu : inlineMenu }

			<div
				ref={ measureRef }
				style={ {
					position: 'absolute',
					visibility: 'hidden',
					pointerEvents: 'none',
					whiteSpace: 'nowrap',
				} }
			>
				{ inlineMenu }
			</div>
		</div>
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
