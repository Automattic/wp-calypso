import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import withDimensions from 'calypso/lib/with-dimensions';
import wpcom from 'calypso/lib/wp';
import { READER_DISCOVER_POPULAR_SITES } from 'calypso/reader/follow-sources';
import Stream from 'calypso/reader/stream';
import ReaderPopularSitesSidebar from 'calypso/reader/stream/reader-popular-sites-sidebar';
import ReaderTagSidebar from 'calypso/reader/stream/reader-tag-sidebar';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getReaderRecommendedSites } from 'calypso/state/reader/recommended-sites/selectors';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import DiscoverNavigation from './discover-navigation';
import { getDiscoverStreamTags, DEFAULT_TAB, buildDiscoverStreamKey } from './helper';

const DiscoverStream = ( props ) => {
	const locale = useLocale();
	const followedTags = useSelector( getReaderFollowedTags );
	const isLoggedIn = useSelector( isUserLoggedIn );
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

	const isDefaultTab = selectedTab === DEFAULT_TAB;

	// Filter followed tags out of interestTags to get recommendedTags.
	const followedTagSlugs = followedTags ? followedTags.map( ( tag ) => tag.slug ) : [];
	const recommendedTags = interestTags.filter( ( tag ) => ! followedTagSlugs.includes( tag.slug ) );

	// Do not supply a fallback empty array as null is good data for getDiscoverStreamTags.
	const recommendedStreamTags = getDiscoverStreamTags(
		followedTags && followedTags.map( ( tag ) => tag.slug ),
		isLoggedIn
	);
	const streamKey = buildDiscoverStreamKey( selectedTab, recommendedStreamTags );

	const streamSidebar = () =>
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
		useCompactCards: true,
		streamSidebar,
		sidebarTabTitle: isDefaultTab ? translate( 'Sites' ) : translate( 'Related' ),
	};

	return (
		<>
			<DiscoverNavigation
				width={ props.width }
				selectedTab={ selectedTab }
				setSelectedTab={ setSelectedTab }
				recommendedTags={ recommendedTags }
			/>
			<Stream { ...streamProps } />
		</>
	);
};

export default withDimensions( DiscoverStream );
