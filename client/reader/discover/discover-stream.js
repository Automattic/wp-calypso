import { isEnabled } from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { Global, css } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
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

const DiscoverStream = ( props ) => {
	let navRedesignV2GlobalStyles;
	if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		navRedesignV2GlobalStyles = css`
			html {
				overflow-y: auto;
			}
			body.is-reader-page,
			.is-reader-page .layout,
			.layout.is-section-reader,
			.layout.is-section-reader .layout__content,
			.is-section-reader {
				background: initial;
			}
			body.is-section-reader {
				background: var( --studio-gray-0 );

				&.rtl .layout__content {
					padding: 16px calc( var( --sidebar-width-max ) ) 16px 16px;
				}

				.layout__content {
					// Add border around everything
					overflow: hidden;
					min-height: 100vh;
					@media only screen and ( min-width: 782px ) {
						padding: 16px 16px 16px calc( var( --sidebar-width-max ) ) !important;
					}
					.layout_primary > div {
						padding-bottom: 0;
					}
				}

				.layout__secondary .global-sidebar {
					border: none;
				}

				.has-no-masterbar .layout__content .main {
					padding-top: 16px;
				}

				div.layout.is-global-sidebar-visible {
					.main {
						padding-top: 24px;
						padding-inline: 64px;
						border-block-end: 1px solid var( --studio-gray-0 );
					}
					.layout__primary > div {
						background: var( --color-surface );
						border-radius: 8px;
						box-shadow: none;
						@media only screen and ( min-width: 600px ) {
							height: calc( 100vh - var( --masterbar-height ) - 50px );
						}
						@media only screen and ( min-width: 782px ) {
							height: calc( 100vh - 32px );
						}
						overflow: hidden;
					}
					.layout__primary > div > div {
						height: 100%;
						overflow: auto;
					}
				}

				@media only screen and ( max-width: 600px ) {
					.navigation-header__main {
						justify-content: normal;
						align-items: center;
						.formatted-header {
							flex: none;
						}
					}
				}

				@media only screen and ( max-width: 781px ) {
					div.layout.is-global-sidebar-visible {
						.layout__primary {
							overflow-x: auto;
						}
					}
					.layout__primary > div {
						background: var( --color-surface );
						margin: 0;
						border-radius: 8px;
						height: calc( 100vh - 32px );
					}
					header.navigation-header {
						padding-inline: 16px;
						padding-bottom: 0;
					}
				}
			}
		`;
	}
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

	const DiscoverHeader = () => (
		<NavigationHeader
			navigationItems={ [] }
			title={ translate( 'Discover' ) }
			subtitle={ subHeaderText }
			className={ classNames( 'discover-stream-header', {
				'reader-dual-column': props.width > WIDE_DISPLAY_CUTOFF,
			} ) }
		/>
	);

	const streamSidebar = () => {
		if ( selectedTab === FIRST_POSTS_TAB && recommendedSites?.length ) {
			return (
				<>
					<h2>{ translate( 'New sites' ) }</h2>
					<ReaderPopularSitesSidebar
						items={ recommendedSites }
						followSource={ READER_DISCOVER_POPULAR_SITES }
					/>
				</>
			);
		}

		if ( ( isDefaultTab || selectedTab === 'latest' ) && recommendedSites?.length ) {
			return (
				<>
					<h2>{ translate( 'Popular sites' ) }</h2>
					<ReaderPopularSitesSidebar
						items={ recommendedSites }
						followSource={ READER_DISCOVER_POPULAR_SITES }
					/>
				</>
			);
		} else if ( ! ( isDefaultTab || selectedTab === 'latest' ) ) {
			return <ReaderTagSidebar tag={ selectedTab } showFollow={ true } />;
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
		<>
			<Global styles={ navRedesignV2GlobalStyles } />
			<Stream { ...streamProps }>
				{ DiscoverHeader() }
				<DiscoverNavigation
					width={ props.width }
					selectedTab={ selectedTab }
					recommendedTags={ interestTags }
				/>
			</Stream>
		</>
	);
};

export default withDimensions( DiscoverStream );
