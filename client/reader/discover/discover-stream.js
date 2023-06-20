import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import DiscoverNav2 from './discover-navigation';

import './discover-stream.scss';

const DEFAULT_TAB = 'recommended';

const DiscoverStream = ( props ) => {
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

	// Filter followed tags out of interestTags to get recommendedTags.
	const followedTagSlugs = followedTags.map( ( tag ) => tag.slug );
	const recommendedTags = interestTags.filter( ( tag ) => ! followedTagSlugs.includes( tag.slug ) );

	const isDefaultTab = selectedTab === DEFAULT_TAB;

	const DiscoverNavigation = () => (
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

	return (
		<>
			<DiscoverNav2 recommendedTags={ recommendedTags } />
			<Stream { ...streamProps } />
		</>
	);
};
export default DiscoverStream;
