import { Button, Gridicon } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { debounce } from 'lodash';
import { useState, useRef, useEffect } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

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
	const followedTags = useSelector( getReaderFollowedTags ) || [];
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

	const shouldHideLeftScrollButton = () => scrollPosition.current < SHOW_SCROLL_THRESHOLD;
	const shouldHideRightScrollButton = () =>
		scrollPosition.current >
		scrollRef.current?.scrollWidth - scrollRef.current?.clientWidth - SHOW_SCROLL_THRESHOLD;

	// To keep track of the navigation tabs scroll position and keep it from appearing to reset
	// after child render.
	const handleScroll = debounce( () => {
		// Save scroll position for later reference.
		scrollPosition.current = scrollRef.current?.scrollLeft;

		// Determine and set visibility classes on scroll buttons.
		const leftScrollButton = document.querySelector(
			`.${ DEFAULT_CLASS }__tabs-scroll-left-button`
		);
		const rightScrollButton = document.querySelector(
			`.${ DEFAULT_CLASS }__tabs-scroll-right-button`
		);
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
	const followedTagSlugs = followedTags.map( ( tag ) => tag.slug );
	const recommendedTags = interestTags.filter( ( tag ) => ! followedTagSlugs.includes( tag.slug ) );

	const DiscoverNavigation = () => (
		<div className={ DEFAULT_CLASS }>
			<Button
				className={ classNames( `${ DEFAULT_CLASS }__tabs-scroll-left-button`, {
					'display-none': shouldHideLeftScrollButton(),
				} ) }
				onClick={ () => bumpScrollX( true ) }
				tabIndex={ -1 }
				aria-hidden={ true }
			>
				<Gridicon icon="chevron-left" />
			</Button>

			<Button
				className={ classNames( `${ DEFAULT_CLASS }__tabs-scroll-right-button`, {
					'display-none': shouldHideRightScrollButton(),
				} ) }
				onClick={ () => bumpScrollX() }
				tabIndex={ -1 }
				aria-hidden={ true }
			>
				<Gridicon icon="chevron-right" />
			</Button>

			<div className={ `${ DEFAULT_CLASS }__tabs` } ref={ scrollRef } onScroll={ handleScroll }>
				<SegmentedControl primary className={ `${ DEFAULT_CLASS }__tab-control` }>
					<SegmentedControl.Item
						key={ DEFAULT_TAB }
						selected={ isDefaultTab }
						onClick={ () => setSelectedTab( DEFAULT_TAB ) }
					>
						{ translate( 'Recommended' ) }
					</SegmentedControl.Item>
					{ recommendedTags.map( ( tag ) => {
						return (
							<SegmentedControl.Item
								key={ tag.slug }
								selected={ tag.slug === selectedTab }
								onClick={ () => setSelectedTab( tag.slug ) }
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
		if ( ! followedTags.length ) {
			streamKey += '-no-tags';
		} else {
			// Ensures a different key depending on the users followed tags list. So the stream can
			// update when the user follows/unfollows other tags.
			streamKey += followedTagSlugs.reduce( ( acc, val ) => acc + `-${ val }`, '' );
		}
	}

	const streamProps = {
		...props,
		isDiscoverTags: ! isDefaultTab,
		streamKey,
		streamHeader: <DiscoverNavigation />,
	};

	return <Stream { ...streamProps } />;
};

export default DiscoverStream;
