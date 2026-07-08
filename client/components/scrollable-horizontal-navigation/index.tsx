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
	const [ showStartArrow, setShowStartArrow ] = useState( false );
	const [ showEndArrow, setShowEndArrow ] = useState( false );

	const updateScrollButtonVisibility = useCallback( () => {
		const container = scrollRef.current;

		if ( ! container ) {
			setShowStartArrow( false );
			setShowEndArrow( false );
			return;
		}

		const { scrollWidth, clientWidth, scrollLeft } = container;
		const canScroll = scrollWidth > clientWidth;

		if ( isRtl ) {
			const isAtStart = Math.abs( scrollLeft ) < SHOW_SCROLL_THRESHOLD;
			const isAtEnd = Math.abs( scrollLeft ) >= scrollWidth - clientWidth - SHOW_SCROLL_THRESHOLD;

			setShowStartArrow( canScroll && ! isAtStart );
			setShowEndArrow( canScroll && ! isAtEnd );
		} else {
			const isAtStart = scrollLeft < SHOW_SCROLL_THRESHOLD;
			const isAtEnd = scrollLeft >= scrollWidth - clientWidth - SHOW_SCROLL_THRESHOLD;

			setShowStartArrow( canScroll && ! isAtStart );
			setShowEndArrow( canScroll && ! isAtEnd );
		}
	}, [ isRtl ] );

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

	const scrollByDirection = useCallback(
		( towardStart: boolean ) => {
			if ( ! scrollRef.current ) {
				return;
			}

			const scrollAmount = scrollRef.current.clientWidth * ( 2 / 3 );
			const directionMultiplier = towardStart ? -1 : 1;
			const rtlMultiplier = isRtl ? -1 : 1;
			const left = scrollAmount * directionMultiplier * rtlMultiplier;

			scrollRef.current.scrollBy( { left, behavior: 'smooth' } );
		},
		[ isRtl ]
	);

	const showLeftWrapper = isRtl ? showEndArrow : showStartArrow;
	const showRightWrapper = isRtl ? showStartArrow : showEndArrow;

	return (
		<div className={ clsx( 'scrollable-horizontal-navigation', className ) }>
			<div
				className={ clsx( 'scrollable-horizontal-navigation__left-button-wrapper', {
					'display-none': ! showLeftWrapper,
				} ) }
				aria-hidden
			>
				<Button
					className="scrollable-horizontal-navigation__left-button"
					onClick={ () => scrollByDirection( ! isRtl ) }
					tabIndex={ -1 }
				>
					<Gridicon icon="chevron-left" />
				</Button>
			</div>

			<div
				className={ clsx( 'scrollable-horizontal-navigation__right-button-wrapper', {
					'display-none': ! showRightWrapper,
				} ) }
				aria-hidden
			>
				<Button
					className="scrollable-horizontal-navigation__right-button"
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
