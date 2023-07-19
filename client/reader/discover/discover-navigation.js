import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { throttle } from 'lodash';
import { useRef } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import { DEFAULT_TAB } from './helper';

import './discover-navigation.scss';

const SHOW_SCROLL_THRESHOLD = 10;
const DEFAULT_CLASS = 'discover-stream-navigation';
const showElement = ( element ) => element && element.classList.remove( 'display-none' );
const hideElement = ( element ) => element && element.classList.add( 'display-none' );

const DiscoverNavigation = ( { recommendedTags, selectedTab, setSelectedTab, width } ) => {
	const scrollRef = useRef();

	const recordTabClick = () => {
		recordAction( 'click_discover_tab' );
		recordGaEvent( 'Clicked Discover Tab' );
	};

	const menuTabClick = ( tab ) => {
		setSelectedTab( tab );
		recordTabClick();
	};

	const bumpScrollX = ( shouldScrollLeft ) => {
		if ( scrollRef.current ) {
			const directionMultiplier = shouldScrollLeft ? -1 : 1;
			const finalPositionX =
				scrollRef.current.scrollLeft +
				// 2/3 reflects the fraction of visible width that will scroll.
				directionMultiplier * scrollRef.current.clientWidth * ( 2 / 3 );
			scrollRef.current.scrollTo( { top: 0, left: finalPositionX, behavior: 'smooth' } );
		}
	};

	const shouldHideLeftScrollButton = () => scrollRef.current?.scrollLeft < SHOW_SCROLL_THRESHOLD;
	const shouldHideRightScrollButton = () =>
		scrollRef.current?.scrollLeft >
		scrollRef.current?.scrollWidth - scrollRef.current?.clientWidth - SHOW_SCROLL_THRESHOLD;

	// To keep track of the navigation tabs scroll position and keep it from appearing to reset
	// after child render.
	const handleScroll = throttle( () => {
		// Determine and set visibility classes on scroll button wrappers.
		const leftScrollButton = document.querySelector( `.${ DEFAULT_CLASS }__left-button-wrapper` );
		const rightScrollButton = document.querySelector( `.${ DEFAULT_CLASS }__right-button-wrapper` );
		shouldHideLeftScrollButton()
			? hideElement( leftScrollButton )
			: showElement( leftScrollButton );
		shouldHideRightScrollButton()
			? hideElement( rightScrollButton )
			: showElement( rightScrollButton );
	}, 50 );

	return (
		<div
			className={ classNames( DEFAULT_CLASS, {
				'reader-dual-column': width > WIDE_DISPLAY_CUTOFF,
			} ) }
		>
			<div
				className={ classNames( `${ DEFAULT_CLASS }__left-button-wrapper`, {
					'display-none': shouldHideLeftScrollButton(),
				} ) }
				aria-hidden={ true }
			>
				<Button
					className={ `${ DEFAULT_CLASS }__left-button` }
					onClick={ () => bumpScrollX( true ) }
					tabIndex={ -1 }
				>
					<Gridicon icon="chevron-left" />
				</Button>
			</div>

			<div
				className={ classNames( `${ DEFAULT_CLASS }__right-button-wrapper`, {
					'display-none': shouldHideRightScrollButton(),
				} ) }
				aria-hidden={ true }
			>
				<Button
					className={ `${ DEFAULT_CLASS }__right-button` }
					onClick={ () => bumpScrollX() }
					tabIndex={ -1 }
				>
					<Gridicon icon="chevron-right" />
				</Button>
			</div>

			<div className={ `${ DEFAULT_CLASS }__tabs` } ref={ scrollRef } onScroll={ handleScroll }>
				<SegmentedControl primary className={ `${ DEFAULT_CLASS }__tab-control` }>
					<SegmentedControl.Item
						key={ DEFAULT_TAB }
						selected={ DEFAULT_TAB === selectedTab }
						onClick={ () => menuTabClick( DEFAULT_TAB ) }
					>
						{ translate( 'Recommended' ) }
					</SegmentedControl.Item>
					<SegmentedControl.Item
						key="latest"
						selected={ 'latest' === selectedTab }
						onClick={ () => menuTabClick( 'latest' ) }
					>
						{ translate( 'Latest' ) }
					</SegmentedControl.Item>
					{ recommendedTags.map( ( tag ) => {
						return (
							<SegmentedControl.Item
								key={ tag.slug }
								selected={ tag.slug === selectedTab }
								onClick={ () => menuTabClick( tag.slug ) }
							>
								{ tag.title }
							</SegmentedControl.Item>
						);
					} ) }
				</SegmentedControl>
			</div>
		</div>
	);
};

export default DiscoverNavigation;
