import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import withDimensions from 'calypso/lib/with-dimensions';
import wpcom from 'calypso/lib/wp';
import { READER_DISCOVER_POPULAR_SITES } from 'calypso/reader/follow-sources';
import Stream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import ReaderPopularSitesSidebar from 'calypso/reader/stream/reader-popular-sites-sidebar';
import ReaderTagSidebar from 'calypso/reader/stream/reader-tag-sidebar';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getReaderRecommendedSites } from 'calypso/state/reader/recommended-sites/selectors';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import DiscoverNavigation from './discover-navigation';
import {
	getDiscoverStreamTags,
	DEFAULT_TAB,
	getSelectedTabTitle,
	buildDiscoverStreamKey,
	FIRST_POSTS_TAB,
} from './helper';

const DISCOVER_HEADER_NAVIGATION_ITEMS = [];

export const DiscoverHeader = ( props ) => {
	const translate = useTranslate();

	const { selectedTab } = props;
	const tabTitle = getSelectedTabTitle( selectedTab );
	let subHeaderText = translate( 'Explore %s blogs that inspire, educate, and entertain.', {
		args: [ tabTitle ],
		comment: '%s is the type of blog being explored e.g. food, art, technology etc.',
	} );
	if ( selectedTab === FIRST_POSTS_TAB ) {
		subHeaderText = translate(
			'Fresh voices, fresh views. Explore first-time posts from new bloggers.'
		);
	}

	return (
		<NavigationHeader
			navigationItems={ DISCOVER_HEADER_NAVIGATION_ITEMS }
			title={ translate( 'Discover' ) }
			subtitle={ subHeaderText }
			className={ clsx( 'discover-stream-header', {
				'reader-dual-column': props.width > WIDE_DISPLAY_CUTOFF,
			} ) }
		/>
	);
};

const DiscoverStream = ( props ) => {
	const locale = useLocale();
	const translate = useTranslate();
	const followedTags = useSelector( getReaderFollowedTags );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const selectedTab = props.selectedTab;
	const recommendedSitesSeed =
		selectedTab === FIRST_POSTS_TAB ? 'discover-new-sites' : 'discover-recommendations';
	const recommendedSites = useSelector(
		( state ) => getReaderRecommendedSites( state, recommendedSitesSeed ) || []
	);
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

	const promptSlug = isBloganuary() ? 'bloganuary' : 'dailyprompt';
	const promptTitle = isBloganuary() ? translate( 'Bloganuary' ) : translate( 'Daily prompts' );
	// Add dailyprompt to the front of interestTags if not present.
	const hasPromptTab = interestTags.filter( ( tag ) => tag.slug === promptSlug ).length;
	if ( ! hasPromptTab ) {
		interestTags.unshift( { title: promptTitle, slug: promptSlug } );
	}

	const isDefaultTab = selectedTab === DEFAULT_TAB;

	// Do not supply a fallback empty array as null is good data for getDiscoverStreamTags.
	const recommendedStreamTags = getDiscoverStreamTags(
		followedTags && followedTags.map( ( tag ) => tag.slug ),
		isLoggedIn
	);
	const streamKey = buildDiscoverStreamKey( selectedTab, recommendedStreamTags );

	const streamSidebar = () => {
		if ( selectedTab === FIRST_POSTS_TAB && recommendedSites?.length ) {
			return (
				<ReaderPopularSitesSidebar
					items={ recommendedSites }
					followSource={ READER_DISCOVER_POPULAR_SITES }
					title={ translate( 'New sites' ) }
				/>
			);
		}

		if ( ( isDefaultTab || selectedTab === 'latest' ) && recommendedSites?.length ) {
			return (
				<ReaderPopularSitesSidebar
					items={ recommendedSites }
					followSource={ READER_DISCOVER_POPULAR_SITES }
					title={ translate( 'Popular sites' ) }
				/>
			);
		} else if ( ! ( isDefaultTab || selectedTab === 'latest' ) ) {
			return <ReaderTagSidebar tag={ selectedTab } showFollow />;
		}
	};

	const streamProps = {
		...props,
		streamKey,
		useCompactCards: true,
		streamSidebar,
		sidebarTabTitle: isDefaultTab ? translate( 'Sites' ) : translate( 'Related' ),
		selectedStreamName: selectedTab,
	};

	return (
		<Stream { ...streamProps }>
			<DiscoverHeader selectedTab={ selectedTab } width={ props.width } />
			<DiscoverNavigation
				width={ props.width }
				selectedTab={ selectedTab }
				recommendedTags={ interestTags }
			/>
		</Stream>
	);
};

export default withDimensions( DiscoverStream );
