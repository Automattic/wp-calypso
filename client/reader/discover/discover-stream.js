import { Button, Gridicon } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { throttle } from 'lodash';
import { useState, useRef, useEffect } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import wpcom from 'calypso/lib/wp';
import { READER_DISCOVER_POPULAR_SITES } from 'calypso/reader/follow-sources';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Stream from 'calypso/reader/stream';
import ReaderPopularSitesSidebar from 'calypso/reader/stream/reader-popular-sites-sidebar';
import ReaderTagSidebar from 'calypso/reader/stream/reader-tag-sidebar';
import { useSelector } from 'calypso/state';
import { getReaderRecommendedSites } from 'calypso/state/reader/recommended-sites/selectors';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import { getDiscoverStreamTags } from './helper';

import './discover-stream.scss';

const DEFAULT_TAB = 'recommended';
const SHOW_SCROLL_THRESHOLD = 10;
const DEFAULT_CLASS = 'discover-stream-navigation';
const showElement = ( element ) => element && element.classList.remove( 'display-none' );
const hideElement = ( element ) => element && element.classList.add( 'display-none' );

const DiscoverStream = ( props ) => {
	const scrollRef = useRef();
	const scrollPosition = useRef( 0 );
	const locale = useLocale();
	const followedTags = useSelector( getReaderFollowedTags );
	const recommendedSites = useSelector(
		( state ) => getReaderRecommendedSites( state, 'discover-recommendations' ) || []
	);
	const [ selectedTab, setSelectedTab ] = useState( DEFAULT_TAB );
	const { data: interestTags = [] } = useQuery( {
		queryKey: [ 'read/interests', locale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/interests`,
					apiNamespace: 'wpcom/v2',
				},
				{
					_locale: locale,
				}
			),
		select: ( data ) => {
			return data.interests;
		},
	} );

	const recordTabClick = () => {
		recordAction( 'click_discover_tab' );
		recordGaEvent( 'Clicked Discover Tab' );
	};

	const menuTabClick = ( tab ) => {
		setSelectedTab( tab );
		recordTabClick();
	};

	const shouldHideLeftScrollButton = () => scrollPosition.current < SHOW_SCROLL_THRESHOLD;
	const shouldHideRightScrollButton = () =>
		scrollPosition.current >
		scrollRef.current?.scrollWidth - scrollRef.current?.clientWidth - SHOW_SCROLL_THRESHOLD;

	// To keep track of the navigation tabs scroll position and keep it from appearing to reset
	// after child render.
	const handleScroll = throttle( () => {
		// Save scroll position for later reference.
		scrollPosition.current = scrollRef.current?.scrollLeft;

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

	// Set the scroll position and focus of navigation tabs when selected tab changes and this
	// component is forced to rerender.
	useEffect( () => {
		// Set 0 timeout to put this at the end of the callstack so it happens after the children
		// rerender.
		setTimeout( () => {
			// Ignore the recommended tab since this is set on load and is next to the reset point.
			if ( selectedTab !== 'recommended' ) {
				const selectedElement = document.querySelector(
					`.${ DEFAULT_CLASS }__tabs .segmented-control__item.is-selected .segmented-control__link`
				);
				selectedElement && selectedElement.focus();

				if ( scrollRef.current ) {
					scrollRef.current.scrollLeft = scrollPosition.current;
				}
			}
		}, 0 );
	}, [ selectedTab ] );

	const isDefaultTab = selectedTab === DEFAULT_TAB;

	// Filter followed tags out of interestTags to get recommendedTags.
	const followedTagSlugs = followedTags ? followedTags.map( ( tag ) => tag.slug ) : [];
	const recommendedTags = interestTags.filter( ( tag ) => ! followedTagSlugs.includes( tag.slug ) );

	// Do not supply a fallback empty array as null is good data for getDiscoverStreamTags.
	const recommendedStreamTags = getDiscoverStreamTags(
		followedTags && followedTags.map( ( tag ) => tag.slug )
	);

	const DiscoverNavigation = () => (
		<div className={ DEFAULT_CLASS }>
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
						selected={ isDefaultTab }
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

	let streamKey = `discover:${ selectedTab }`;
	// We want a different stream key for recommended depending on the followed tags that are available.
	if ( isDefaultTab ) {
		// Ensures a different key depending on the users stream tags list. So the stream can update
		// when the user follows/unfollows other tags. Sort the list first so the key is the same
		// per same tags followed. This is necessary since we load a default tag list when none are
		// followed.
		recommendedStreamTags.sort();
		streamKey += recommendedStreamTags.reduce( ( acc, val ) => acc + `-${ val }`, '' );
	}

	const streamSidebar =
		( isDefaultTab || selectedTab === 'latest' ) && recommendedSites?.length ? (
			<>
				<h2>{ translate( 'Popular Sites' ) }</h2>
				<ReaderPopularSitesSidebar
					items={ recommendedSites }
					followSource={ READER_DISCOVER_POPULAR_SITES }
				/>
			</>
		) : (
			<ReaderTagSidebar tag={ selectedTab } />
		);

	const streamProps = {
		...props,
		streamKey,
		streamHeader: recommendedTags.length ? <DiscoverNavigation /> : null,
		useCompactCards: true,
		streamSidebar,
		sidebarTabTitle: isDefaultTab ? translate( 'Sites' ) : translate( 'Related' ),
	};

	return <Stream { ...streamProps } />;
};

export default DiscoverStream;
