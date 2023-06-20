import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

import './discover-stream.scss';

const DEFAULT_TAB = 'recommended';

const DiscoverStream = ( props ) => {
	const locale = useLocale();
	const followedTags = useSelector( getReaderFollowedTags ) || [];
	const [ selectedTab, setSelectedTab ] = useState( DEFAULT_TAB );
	const scrollRef = useRef();
	const scrollPosition = useRef( 0 );
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

	// Filter followed tags out of interestTags to get recommendedTags.
	const followedTagSlugs = followedTags.map( ( tag ) => tag.slug );
	const recommendedTags = interestTags.filter( ( tag ) => ! followedTagSlugs.includes( tag.slug ) );

	const isDefaultTab = selectedTab === DEFAULT_TAB;

	// To keep track of the navigation tabs scroll position and keep it from appearing to reset
	// after child render.
	const trackScrollPosition = () => {
		scrollPosition.current = scrollRef.current?.scrollLeft;
	};

	// Set the scroll position of the navigation tabs to what we last tracked.
	if ( scrollRef.current ) {
		// Set 0 timeout to put this at the end of the callstack so it happens after the children
		// rerender.
		setTimeout( () => {
			scrollRef.current.scrollLeft = scrollPosition.current;
		}, 0 );
	}

	const DiscoverNavigation = () => (
		<div className="discover-stream__tabs" ref={ scrollRef } onScroll={ trackScrollPosition }>
			<SegmentedControl primary className="discover-stream__tab-control">
				<SegmentedControl.Item
					key={ DEFAULT_TAB }
					selected={ DEFAULT_TAB === selectedTab }
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
