import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import { addQueryArgs } from 'calypso/lib/url';
import withDimensions from 'calypso/lib/with-dimensions';
import wpcom from 'calypso/lib/wp';
import DiscoverNavigation from 'calypso/reader/discover/components/navigation/v1';
import DiscoverNavigationV2 from 'calypso/reader/discover/components/navigation/v2';
import DiscoverTagsNavigation from 'calypso/reader/discover/components/tags-navigation';
import Stream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import {
	getDiscoverStreamTags,
	DEFAULT_TAB,
	getSelectedTabTitle,
	buildDiscoverStreamKey,
	FIRST_POSTS_TAB,
} from './helper';
import './style.scss';

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
	const selectedTab = props.selectedTab || DEFAULT_TAB;

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

	const urlSelectedTag = new URLSearchParams( window.location.search ).get( 'selectedTag' );
	const defaultTag = interestTags[ 0 ]?.slug || '';
	const selectedTag = urlSelectedTag || defaultTag;

	// Update URL with default tag when on tags tab with no tag selected
	useEffect( () => {
		if ( selectedTab === 'tags' && ! urlSelectedTag && defaultTag ) {
			page.replace( addQueryArgs( { selectedTag: defaultTag }, '/discover/tags' ) );
		}
	}, [ selectedTab, urlSelectedTag, defaultTag ] );

	const isDefaultTab = selectedTab === DEFAULT_TAB;

	// Do not supply a fallback empty array as null is good data for getDiscoverStreamTags.
	const recommendedStreamTags = getDiscoverStreamTags(
		followedTags && followedTags.map( ( tag ) => tag.slug ),
		isLoggedIn
	);

	const effectiveTabSelection = 'tags' === selectedTab ? selectedTag : selectedTab;

	const streamKey = buildDiscoverStreamKey( effectiveTabSelection, recommendedStreamTags );

	const streamProps = {
		...props,
		streamKey,
		useCompactCards: true,
		sidebarTabTitle: isDefaultTab ? translate( 'Sites' ) : translate( 'Related' ),
		selectedStreamName: selectedTab,
	};

	return (
		<Stream { ...streamProps }>
			<DiscoverHeader selectedTab={ effectiveTabSelection } width={ props.width } />
			{ config.isEnabled( 'reader/discovery-v2' ) ? (
				<>
					<DiscoverNavigationV2 selectedTab={ selectedTab } />
					{ selectedTab === 'tags' && (
						<DiscoverTagsNavigation
							width={ props.width }
							selectedTag={ selectedTag }
							recommendedTags={ interestTags }
						/>
					) }
				</>
			) : (
				<DiscoverNavigation
					width={ props.width }
					selectedTab={ selectedTab }
					recommendedTags={ interestTags }
				/>
			) }
		</Stream>
	);
};

export default withDimensions( DiscoverStream );
