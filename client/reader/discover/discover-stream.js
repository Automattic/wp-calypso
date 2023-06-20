import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { getSelectedTab } from 'calypso/state/reader/discover/selectors';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import DiscoverNavigation from './discover-navigation';

import './discover-stream.scss';

const DEFAULT_TAB = 'recommended';

const DiscoverFeed = ( { followedTagSlugs, ...props } ) => {
	const selectedTab = useSelector( getSelectedTab );
	const isDefaultTab = selectedTab === DEFAULT_TAB;

	let streamKey = `discover:${ selectedTab }`;
	// We want a different stream key for recommended depending on the followed tags that are available.
	if ( isDefaultTab ) {
		if ( ! followedTagSlugs.length ) {
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
	};

	return <Stream { ...streamProps } />;
};

const DiscoverStream = ( props ) => {
	const locale = useLocale();
	const followedTags = useSelector( getReaderFollowedTags ) || [];

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

	return (
		<>
			<DiscoverNavigation recommendedTags={ recommendedTags } key="discover-navigation" />
			<DiscoverFeed { ...props } followedTagSlugs={ followedTagSlugs } />
		</>
	);
};
export default DiscoverStream;
