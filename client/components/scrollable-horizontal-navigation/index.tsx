import { Button, Gridicon, SegmentedControl } from '@automattic/components';
import { throttle } from '@wordpress/compose';
import clsx from 'clsx';
import { useRtl } from 'i18n-calypso';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import './styles.scss';

const SHOW_SCROLL_THRESHOLD = 10;

type BaseTab = {
	slug: string;
	title: string;
};

type Tab< T extends object > = T & BaseTab;

interface Props< T extends object > {
	className?: string;
	onTabClick: ( tabSlug: string ) => void;
	selectedTab: string;
	tabs: Tab< T >[];
	titleField?: keyof Tab< T >;
}

const ScrollableHorizontalNavigation = < T extends object >( {
	className,
	onTabClick,
	selectedTab,
	tabs,
	titleField = 'title',
}: Props< T > ) => {
	const scrollRef = useRef< HTMLDivElement >( null );
	const isRtl = useRtl();
	const [ showLeftArrow, setShowLeftArrow ] = useState( false );
	const [ showRightArrow, setShowRightArrow ] = useState( false );

	// Arrow visibility is tied to physical button position, not reading direction:
	// the left button shows once scrolled past the physical left edge, the right
	// button while content remains past the physical right edge. `Math.abs`
	// normalizes `scrollLeft`, which is negative in RTL containers. A small
	// threshold hides arrows when nearly at an edge. Reading direction only
	// affects scroll direction on click (handled below); chevrons stay physical.
	const updateScrollButtonVisibility = useCallback( () => {
		const container = scrollRef.current;

		if ( ! container ) {
			setShowLeftArrow( false );
			setShowRightArrow( false );
			return;
		}

		const { scrollLeft, scrollWidth, clientWidth } = container;
		const scrollLeftAbs = Math.abs( Math.floor( scrollLeft ) );
		const maxScrollLeft = scrollWidth - clientWidth;

		setShowLeftArrow( scrollLeftAbs > SHOW_SCROLL_THRESHOLD );
		setShowRightArrow( scrollLeftAbs + SHOW_SCROLL_THRESHOLD < maxScrollLeft );
	}, [] );

	useLayoutEffect( () => {
		updateScrollButtonVisibility();
	}, [ tabs, selectedTab, updateScrollButtonVisibility ] );

	useEffect( () => {
		const container = scrollRef.current;

		if ( ! container ) {
			return;
		}

		const observer = new ResizeObserver( updateScrollButtonVisibility );
		observer.observe( container );
		updateScrollButtonVisibility();

		return () => observer.disconnect();
	}, [ tabs, updateScrollButtonVisibility ] );

	useEffect( () => {
		const selectedTabElement = scrollRef.current?.querySelector( '.is-selected' );
		selectedTabElement?.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );

		const rafId = requestAnimationFrame( updateScrollButtonVisibility );

		return () => cancelAnimationFrame( rafId );
	}, [ selectedTab, updateScrollButtonVisibility ] );

	const handleScroll = useMemo(
		() => throttle( updateScrollButtonVisibility, 50 ),
		[ updateScrollButtonVisibility ]
	);

	// `scrollBy` moves the viewport physically: a negative delta scrolls toward
	// the physical left, a positive delta toward the physical right, in both LTR
	// and RTL.
	const scrollByDirection = useCallback( ( scrollLeftwards: boolean ) => {
		if ( ! scrollRef.current ) {
			return;
		}

		const scrollAmount = scrollRef.current.clientWidth * ( 2 / 3 );
		const left = scrollLeftwards ? -scrollAmount : scrollAmount;

		scrollRef.current.scrollBy( { left, behavior: 'smooth' } );
	}, [] );

	return (
		<div className={ clsx( 'scrollable-horizontal-navigation', className ) }>
			<div
				className={ clsx( 'scrollable-horizontal-navigation__left-button-wrapper', {
					'display-none': ! showLeftArrow,
				} ) }
				aria-hidden
			>
				<Button
					className="scrollable-horizontal-navigation__left-button"
					// The physical-left button scrolls toward the start in LTR (physically
					// left) and toward the start in RTL (physically right).
					onClick={ () => scrollByDirection( ! isRtl ) }
					tabIndex={ -1 }
				>
					<Gridicon icon="chevron-left" />
				</Button>
			</div>

			<div
				className={ clsx( 'scrollable-horizontal-navigation__right-button-wrapper', {
					'display-none': ! showRightArrow,
				} ) }
				aria-hidden
			>
				<Button
					className="scrollable-horizontal-navigation__right-button"
					// The physical-right button scrolls toward the end in LTR (physically
					// right) and toward the end in RTL (physically left).
					onClick={ () => scrollByDirection( isRtl ) }
					tabIndex={ -1 }
				>
					<Gridicon icon="chevron-right" />
				</Button>
			</div>

			<div
				className="scrollable-horizontal-navigation__tabs"
				ref={ scrollRef }
				onScroll={ handleScroll }
			>
				<SegmentedControl primary className="scrollable-horizontal-navigation__tab-control">
					{ tabs.map( ( tab ) => {
						return (
							<SegmentedControl.Item
								key={ tab.slug }
								selected={ tab.slug === selectedTab }
								onClick={ () => {
									onTabClick( tab.slug );
								} }
							>
								{ tab[ titleField ] }
							</SegmentedControl.Item>
						);
					} ) }
				</SegmentedControl>
			</div>
		</div>
	);
};

export default ScrollableHorizontalNavigation;
