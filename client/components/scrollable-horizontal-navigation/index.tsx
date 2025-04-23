import './styles.scss';
import {
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { throttle } from 'lodash';
import { useEffect, useRef } from 'react';

const SHOW_SCROLL_THRESHOLD = 10;
const showElement = ( element: Element | null ) => element?.classList.remove( 'display-none' );
const hideElement = ( element: Element | null ) => element?.classList.add( 'display-none' );

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
	const translate = useTranslate();

	// Scroll the selected tab into view on initial render and whenever it changes.
	useEffect( () => {
		const selectedTabElement = scrollRef.current?.querySelector(
			`.components-toggle-group-control-option-base[data-value="${ selectedTab }"]`
		);
		selectedTabElement?.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	}, [ selectedTab ] );

	const bumpScrollX = ( shouldScrollLeft = false ) => {
		if ( scrollRef.current ) {
			const directionMultiplier = shouldScrollLeft ? -1 : 1;
			const finalPositionX =
				scrollRef.current.scrollLeft +
				// 2/3 reflects the fraction of visible width that will scroll.
				directionMultiplier * scrollRef.current.clientWidth * ( 2 / 3 );
			scrollRef.current.scrollTo( { top: 0, left: finalPositionX, behavior: 'smooth' } );
		}
	};

	const shouldHideLeftScrollButton = () =>
		scrollRef.current && scrollRef.current.scrollLeft < SHOW_SCROLL_THRESHOLD;
	const shouldHideRightScrollButton = () =>
		scrollRef.current &&
		scrollRef.current.scrollLeft >
			scrollRef.current.scrollWidth - scrollRef.current.clientWidth - SHOW_SCROLL_THRESHOLD;

	// To keep track of the navigation tabs scroll position and keep it from appearing to reset
	// after child render.
	const handleScroll = throttle( () => {
		// Determine and set visibility classes on scroll button wrappers.
		const leftScrollButton = document.querySelector(
			'.scrollable-horizontal-navigation__left-button-wrapper'
		);
		const rightScrollButton = document.querySelector(
			'.scrollable-horizontal-navigation__right-button-wrapper'
		);
		shouldHideLeftScrollButton()
			? hideElement( leftScrollButton )
			: showElement( leftScrollButton );
		shouldHideRightScrollButton()
			? hideElement( rightScrollButton )
			: showElement( rightScrollButton );
	}, 50 );

	function onTabChange( tabSlug: string | number | undefined ): void {
		if ( typeof tabSlug !== 'string' ) {
			return;
		}

		onTabClick( tabSlug );
	}

	return (
		<div className={ clsx( 'scrollable-horizontal-navigation', className ) }>
			<div
				className={ clsx( 'scrollable-horizontal-navigation__left-button-wrapper', {
					'display-none': shouldHideLeftScrollButton(),
				} ) }
				aria-hidden
			>
				<Button
					className="scrollable-horizontal-navigation__left-button"
					onClick={ () => bumpScrollX( true ) }
					tabIndex={ -1 }
				>
					<Icon icon={ chevronLeft } />
				</Button>
			</div>

			<div
				className={ clsx( 'scrollable-horizontal-navigation__right-button-wrapper', {
					'display-none': shouldHideRightScrollButton(),
				} ) }
				aria-hidden
			>
				<Button
					className="scrollable-horizontal-navigation__right-button"
					onClick={ () => bumpScrollX() }
					tabIndex={ -1 }
				>
					<Icon icon={ chevronRight } />
				</Button>
			</div>

			<div
				className="scrollable-horizontal-navigation__tabs"
				ref={ scrollRef }
				onScroll={ handleScroll }
			>
				<ToggleGroupControl
					hideLabelFromVision
					label={ translate( 'Tags' ) }
					value={ selectedTab }
					onChange={ onTabChange }
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				>
					{ tabs.map( ( tab ): JSX.Element => {
						return (
							<ToggleGroupControlOption
								key={ tab.slug }
								label={ tab[ titleField ] as string }
								value={ tab.slug }
							/>
						);
					} ) }
				</ToggleGroupControl>
			</div>
		</div>
	);
};

export default ScrollableHorizontalNavigation;
