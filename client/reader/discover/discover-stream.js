import page from '@automattic/calypso-router';
import { addLocaleToPathLocaleInFront, useLocale } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { addQueryArgs } from 'calypso/lib/url';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderBackButton from 'calypso/reader/components/back-button';
import ReaderMain from 'calypso/reader/components/reader-main';
import DiscoverAddNew from 'calypso/reader/discover/components/add-new';
import DiscoverNavigation from 'calypso/reader/discover/components/navigation';
import Reddit from 'calypso/reader/discover/components/reddit';
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
	ADD_NEW_TAB,
	REDDIT_TAB,
} from './helper';
import './style.scss';

const DISCOVER_HEADER_NAVIGATION_ITEMS = [];

export const DiscoverHeader = ( props ) => {
	const translate = useTranslate();

	const { selectedTab } = props;
	const tabTitle = getSelectedTabTitle( selectedTab );

	let subHeaderText;
	switch ( selectedTab ) {
		case FIRST_POSTS_TAB:
			subHeaderText = translate(
				'Fresh voices, fresh views. Explore first-time posts from new bloggers.'
			);
			break;
		case ADD_NEW_TAB:
			subHeaderText = translate( 'Subscribe to new blogs, newsletters, and RSS feeds.' );
			break;
		case REDDIT_TAB:
			subHeaderText = translate( 'Follow your favorite subreddits inside the Reader.' );
			break;
		default:
			subHeaderText = translate( 'Explore %s blogs that inspire, educate, and entertain.', {
				args: [ tabTitle ],
				comment: '%s is the type of blog being explored e.g. food, art, technology etc.',
			} );
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
	const translate = useTranslate();
	const currentLocale = useLocale();
	const followedTags = useSelector( getReaderFollowedTags );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const selectedTab = props.selectedTab || DEFAULT_TAB;
	const selectedTag = props.query?.selectedTag;

	// If the selected tab is tags and no selectedTag is provided, redirect to the tags tab with dailyprompt selected.
	if ( selectedTab === 'tags' && ! selectedTag ) {
		const redirectPath = '/discover/tags';
		const localizedPath = addLocaleToPathLocaleInFront( redirectPath, currentLocale );
		return page.redirect( addQueryArgs( { selectedTag: 'dailyprompt' }, localizedPath ) );
	}

	const isDefaultTab = selectedTab === DEFAULT_TAB;

	// Do not supply a fallback empty array as null is good data for getDiscoverStreamTags
	const recommendedStreamTags = getDiscoverStreamTags(
		followedTags && followedTags.map( ( tag ) => tag.slug ),
		isLoggedIn
	);

	const effectiveTabSelection = 'tags' === selectedTab ? selectedTag : selectedTab;
	const streamKey = buildDiscoverStreamKey( effectiveTabSelection, recommendedStreamTags );

	const handleTagSelect = ( tag ) => {
		const redirectPath = '/discover/tags';
		const localizedPath = addLocaleToPathLocaleInFront( redirectPath, currentLocale );
		page.replace( addQueryArgs( { selectedTag: tag }, localizedPath ) );
	};

	const streamProps = {
		...props,
		streamKey,
		useCompactCards: true,
		showBack: false, // We will instead add this through the header section, since not all discover tabs have a stream to render the back button.
		sidebarTabTitle: isDefaultTab ? translate( 'Sites' ) : translate( 'Related' ),
		selectedStreamName: selectedTab,
	};

	const HeaderAndNavigation = () => {
		return (
			<>
				<ReaderBackButton />
				<DiscoverHeader selectedTab={ effectiveTabSelection } width={ props.width } />
				<DiscoverNavigation selectedTab={ selectedTab } />

				{ selectedTab === 'tags' && (
					<DiscoverTagsNavigation
						width={ props.width }
						selectedTag={ selectedTag }
						onTagSelect={ handleTagSelect }
					/>
				) }
			</>
		);
	};

	const TAB_COMPONENTS = {
		[ ADD_NEW_TAB ]: DiscoverAddNew,
		[ REDDIT_TAB ]: Reddit,
	};

	const ContentComponent = TAB_COMPONENTS[ selectedTab ];
	if ( ContentComponent ) {
		return (
			<ReaderMain className={ clsx( 'following main', props.className ) }>
				<HeaderAndNavigation />
				<div className="reader__content">
					<ContentComponent />
				</div>
			</ReaderMain>
		);
	}

	return (
		<Stream { ...streamProps }>
			<HeaderAndNavigation />
		</Stream>
	);
};

export default withDimensions( DiscoverStream );
