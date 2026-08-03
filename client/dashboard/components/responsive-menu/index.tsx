import {
	__experimentalHStack as HStack,
	Button,
	DropdownMenu,
	IconType,
} from '@wordpress/components';
import { throttle, useViewportMatch } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight, menu } from '@wordpress/icons';
import React, { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from 'react';
import { useAnalytics } from '../../app/analytics';
import Menu from '../menu';
import RouterLinkMenuItem from '../router-link-menu-item';

import './style.scss';

// <RouterLinkButton> uses `createLink` from TanStack, which widens `children`
// to also accept a render-prop function and `onClick` to require an event
// argument, and double-wraps `ref`. ResponsiveMenu only ever treats items as
// plain menu items, we don't want to support the features provided by TanStack.
// This type narrows those back to what we actually support while keeping the
// rest of the link typing (e.g. the `to` route validation).
type ResponsiveMenuItemProps = Omit<
	ComponentProps< typeof RouterLinkMenuItem >,
	'children' | 'onClick' | 'ref'
> & {
	children: React.ReactNode;
	onClick?: ( event?: React.MouseEvent< Element > ) => void;
};

// The children of ResponsiveMenu can be any usual ReactNode, but if it _is_ an element
// with props, then those props must be ResponsiveMenu.Item props.
type ResponsiveMenuChildNode =
	| Exclude< React.ReactNode, React.ReactElement | Iterable< React.ReactNode > >
	| React.ReactElement< ResponsiveMenuItemProps >
	| Iterable< ResponsiveMenuChildNode >;

type ResponsiveMenuProps = {
	prefix?: React.ReactNode;
	children: ResponsiveMenuChildNode;
	icon?: React.ReactElement;
	label?: string;
	dropdownPlacement?: 'bottom-end' | 'bottom-start' | 'bottom';
};

function ScrollButton( {
	icon,
	style,
	onClick,
}: {
	icon: IconType;
	style: CSSProperties;
	onClick: () => void;
} ) {
	return (
		<div
			style={ {
				position: 'absolute',
				zIndex: 1,
				height: '100%',
				alignItems: 'center',
				transition: 'opacity 0.2s ease-in-out',
				pointerEvents: 'none',
				...style,
			} }
		>
			<Button
				icon={ icon }
				style={ {
					padding: '6px',
					pointerEvents: 'auto',
					width: '32px',
					height: '32px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'var(--dashboard__background-color)',
				} }
				onClick={ onClick }
			/>
		</div>
	);
}

function ResponsiveMenu( {
	prefix,
	children,
	icon = menu,
	label = 'Menu',
	dropdownPlacement = 'bottom-end',
}: ResponsiveMenuProps ) {
	const { recordTracksEvent } = useAnalytics();
	const isDesktop = useViewportMatch( 'medium' );

	const containerRef = useRef< HTMLDivElement | null >( null );

	const [ showLeftButton, setShowLeftButton ] = useState( false );
	const [ showRightButton, setShowRightButton ] = useState( false );

	const updateScrollButtonVisibility = () => {
		const container = containerRef.current;
		if ( ! container ) {
			return;
		}

		const { scrollWidth, clientWidth, scrollLeft } = container;
		const scrollThreshold = 10;
		const canScroll = scrollWidth > clientWidth;

		if ( isRTL() ) {
			const isAtStart = Math.abs( scrollLeft ) < scrollThreshold;
			const isAtEnd = Math.abs( scrollLeft ) >= scrollWidth - clientWidth - scrollThreshold;

			setShowLeftButton( canScroll && ! isAtEnd );
			setShowRightButton( canScroll && ! isAtStart );
		} else {
			const isAtStart = scrollLeft < scrollThreshold;
			const isAtEnd = scrollLeft >= scrollWidth - clientWidth - scrollThreshold;

			setShowLeftButton( canScroll && ! isAtStart );
			setShowRightButton( canScroll && ! isAtEnd );
		}
	};

	// Scroll the active tab into view on initial render.
	useEffect( () => {
		const activeItemElement = containerRef.current?.querySelector( '.active' );
		activeItemElement?.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	}, [] );

	// Show/hide scroll buttons when the menu width resizes.
	useEffect( () => {
		if ( ! containerRef.current ) {
			return;
		}

		const observer = new ResizeObserver( updateScrollButtonVisibility );
		observer.observe( containerRef.current );

		updateScrollButtonVisibility();

		return () => observer.disconnect();
	}, [ isDesktop ] );

	const handleScroll = throttle( updateScrollButtonVisibility, 50 );

	// Scroll the menu slightly horizontally when the scroll buttons are clicked.
	const bumpScrollX = ( shouldScrollLeft = false ) => {
		if ( containerRef.current ) {
			const directionMultiplier = shouldScrollLeft ? -1 : 1;

			// 2/3 reflects the fraction of visible width that will scroll.
			const scrollAmount = containerRef.current.clientWidth * ( 2 / 3 );

			const finalPositionX = containerRef.current.scrollLeft + directionMultiplier * scrollAmount;

			containerRef.current.scrollTo( { top: 0, left: finalPositionX, behavior: 'smooth' } );
		}
	};

	if ( isDesktop ) {
		const inlineMenu = (
			<Menu>
				{ React.Children.map( children, ( child ) => {
					if ( React.isValidElement( child ) && child.type === ResponsiveMenu.Item ) {
						const item = child as React.ReactElement< ResponsiveMenuItemProps >;
						if ( item.props.target === '_blank' ) {
							return (
								<Button
									className="dashboard-menu__item"
									variant="tertiary"
									{ ...item.props }
									onClick={ ( event: React.MouseEvent< Element > ) => {
										item.props.onClick?.( event );
										recordTracksEvent( 'calypso_dashboard_menu_item_click', {
											to: item.props.href ?? '',
										} );
									} }
								>
									<HStack justify="flex-start" spacing={ 1 }>
										<span>{ item.props.children }</span>
										<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
									</HStack>
								</Button>
							);
						}

						return (
							<Menu.Item
								{ ...item.props }
								onClick={ ( event: React.MouseEvent< Element > ) => {
									item.props.onClick?.( event );
									recordTracksEvent( 'calypso_dashboard_menu_item_click', {
										to: item.props.to ?? '',
									} );
								} }
							/>
						);
					}

					return child;
				} ) }
			</Menu>
		);

		return (
			<HStack spacing={ 3 }>
				{ prefix }
				<div
					style={ {
						position: 'relative',
						width: '100%',
						display: 'flex',
						overflow: 'visible',
					} }
				>
					<ScrollButton
						icon={ chevronLeft }
						style={ {
							left: '-2px',
							paddingRight: '30px',
							background:
								'linear-gradient(90deg, var(--dashboard__background-color) 30%, transparent 100%)',
							display: showLeftButton ? 'flex' : 'none',
						} }
						onClick={ () => bumpScrollX( true ) }
					/>

					<div
						ref={ containerRef }
						className="dashboard-responsive-menu__scrollable-container"
						onScroll={ handleScroll }
					>
						{ inlineMenu }
					</div>

					<ScrollButton
						icon={ chevronRight }
						style={ {
							right: '-2px',
							paddingLeft: '30px',
							background:
								'linear-gradient(270deg, var(--dashboard__background-color) 30%, transparent 100%)',
							display: showRightButton ? 'flex' : 'none',
						} }
						onClick={ () => bumpScrollX() }
					/>
				</div>
			</HStack>
		);
	}

	return (
		<DropdownMenu
			className="dashboard-responsive-menu"
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
							const item = child as React.ReactElement< ResponsiveMenuItemProps >;
							if ( item.props.target === '_blank' ) {
								return (
									<Menu.ItemLink
										{ ...item.props }
										onClick={ ( event ) => {
											item.props.onClick?.( event );
											recordTracksEvent( 'calypso_dashboard_menu_item_click', {
												to: item.props.href ?? '',
											} );
										} }
									>
										<HStack justify="flex-start" spacing={ 1 }>
											<span>{ item.props.children }</span>
											<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
										</HStack>
									</Menu.ItemLink>
								);
							}

							return (
								<RouterLinkMenuItem
									{ ...item.props }
									onClick={ ( event ) => {
										onClose();
										item.props.onClick?.( event );
										recordTracksEvent( 'calypso_dashboard_menu_item_click', {
											to: item.props.to ?? '',
										} );
									} }
								/>
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
	_props: ResponsiveMenuItemProps
) {
	// This is going to be replaced with the right menu item depending on the screen size.
	return null;
};

export default ResponsiveMenu;
