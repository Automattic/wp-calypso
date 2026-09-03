import { isEnabled } from '@automattic/calypso-config';
import { SiteSubscriptionsQueryPropsProvider } from '@automattic/data-stores/src/reader/contexts';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useFollowedTags } from 'calypso/reader/data/tags';
import DiscoverHeaderAndNavigation from 'calypso/reader/discover/components/header-and-navigation';
import DiscoverNewBlogs from 'calypso/reader/discover/new-blogs';
import { useOonRecs } from 'calypso/reader/discover/new-blogs/use-oon-recs';
import AddSubscriptionForm from 'calypso/reader/new-subscription/components/add-subscription-form';
import { ADD_SUBSCRIPTION_CONFIGS } from 'calypso/reader/new-subscription/components/add-subscription-form/consts';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getDiscoverStreamTags, RECOMMENDED_TAB, buildDiscoverStreamKey } from './helper';

const DiscoverStream = ( props ) => {
	const translate = useTranslate();
	const { data: followedTags } = useFollowedTags();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const oonRecs = useOonRecs();
	const selectedTab = props.selectedTab || RECOMMENDED_TAB;
	const selectedTag = props.query?.selectedTag ?? 'dailyprompt';

	const effectiveTabSelection = 'tags' === selectedTab ? selectedTag : selectedTab;
	const headerAndNavigationProps = {
		width: props.width,
		selectedTab: selectedTab,
		selectedTag: selectedTag,
	};

	if ( ADD_SUBSCRIPTION_CONFIGS[ selectedTab ] ) {
		return (
			<ReaderMain className={ clsx( 'following main', props.className ) }>
				<DiscoverHeaderAndNavigation { ...headerAndNavigationProps } />
				<SiteSubscriptionsQueryPropsProvider>
					<AddSubscriptionForm type={ selectedTab } />
				</SiteSubscriptionsQueryPropsProvider>
			</ReaderMain>
		);
	}

	// Do not supply a fallback empty array as null is good data for getDiscoverStreamTags
	const recommendedStreamTags = getDiscoverStreamTags(
		followedTags && followedTags.map( ( tag ) => tag.slug ),
		isLoggedIn
	);

	const streamKey = buildDiscoverStreamKey( effectiveTabSelection, recommendedStreamTags );

	// "Discover new blogs" (READ-542): one bounded block at the top of the
	// Recommended stream, right under the Discover navigation. Not mounted at
	// all for cold-start users or once the user hides it.
	const showOonModule =
		selectedTab === RECOMMENDED_TAB &&
		isEnabled( 'reader/discover-new-blogs' ) &&
		! oonRecs.isColdStart &&
		! oonRecs.isHidden &&
		oonRecs.recs.length > 0;

	return (
		<Stream
			{ ...props }
			streamKey={ streamKey }
			sidebarTabTitle={
				selectedTab === RECOMMENDED_TAB ? translate( 'Sites' ) : translate( 'Related' )
			}
			selectedStreamName={ selectedTab }
			useCompactCards
			inStreamBlock={
				showOonModule ? (
					<DiscoverNewBlogs
						recs={ oonRecs.recs }
						dismissBlog={ oonRecs.dismissBlog }
						hide={ oonRecs.hide }
					/>
				) : null
			}
			inStreamBlockPosition={ 0 }
		>
			<DiscoverHeaderAndNavigation { ...headerAndNavigationProps } />
		</Stream>
	);
};

export default DiscoverStream;
