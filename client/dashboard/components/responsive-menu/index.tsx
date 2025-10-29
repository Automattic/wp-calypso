import { __experimentalHStack as HStack, Button, DropdownMenu, Icon } from '@wordpress/components';
import { throttle, useViewportMatch } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight, menu } from '@wordpress/icons';
import React, { useEffect, useRef, useState, ComponentProps, CSSProperties } from 'react';
import Menu from '../menu';
import RouterLinkMenuItem from '../router-link-menu-item';

type ResponsiveMenuProps = {
	prefix?: React.ReactNode;
	children: React.ReactNode;
	icon?: React.ReactElement;
	label?: string;
	dropdownPlacement?: 'bottom-end' | 'bottom-start' | 'bottom';
};

function ScrollButton( {
	style,
	onClick,
	children,
}: {
	style: CSSProperties;
	onClick: () => void;
	children: React.ReactNode;
} ) {
	return (
		<div
			style={ {
				position: 'absolute',
				zIndex: 1,
				pointerEvents: 'none',
				height: '100%',
				alignItems: 'center',
				transition: 'opacity 0.2s ease-in-out',
				...style,
			} }
			aria-hidden
		>
			<Button
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
				tabIndex={ -1 }
				onClick={ onClick }
			>
				{ children }
			</Button>
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
						style={ {
							left: '-2px',
							paddingRight: '30px',
							background:
								'linear-gradient(90deg, var(--dashboard__background-color) 30%, transparent 100%)',
							display: showLeftButton ? 'flex' : 'none',
							pointerEvents: showLeftButton ? 'auto' : 'none',
						} }
						onClick={ () => bumpScrollX( true ) }
					>
						<Icon icon={ chevronLeft } />
					</ScrollButton>

					<div
						ref={ containerRef }
						style={ {
							overflowX: 'scroll',
							scrollbarWidth: 'none',
							msOverflowStyle: 'none',
							padding: '2px',
							margin: '-2px',
						} }
						onScroll={ handleScroll }
					>
						{ inlineMenu }
					</div>

					<ScrollButton
						style={ {
							right: '-2px',
							paddingLeft: '30px',
							background:
								'linear-gradient(270deg, var(--dashboard__background-color) 30%, transparent 100%)',
							display: showRightButton ? 'flex' : 'none',
							pointerEvents: showRightButton ? 'auto' : 'none',
						} }
						onClick={ () => bumpScrollX() }
					>
						<Icon icon={ chevronRight } />
					</ScrollButton>
				</div>
			</HStack>
		);
	}

	return (
		<DropdownMenu
			icon={ icon }
			label={ label }
			popoverProps={ {
				placement: dropdownPlacement,
			} }
			style={ { justifyContent: 'flex-end' } }
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
