import { useTranslate } from 'i18n-calypso';
import ReaderFeedHeader from 'calypso/blocks/reader-feed-header';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPostCounts from 'calypso/components/data/query-post-counts';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { useSiteTags } from 'calypso/data/site-tags/use-site-tags';
import withDimensions from 'calypso/lib/with-dimensions';
import FeedError from 'calypso/reader/feed-error';
import { getFollowerCount, getSiteName } from 'calypso/reader/get-helpers';
import SiteBlocked from 'calypso/reader/site-blocked';
import Stream from 'calypso/reader/stream';
import FeedStreamSidebar from 'calypso/reader/stream/site-feed-sidebar';
import { useSelector } from 'calypso/state';
import { getAllPostCount } from 'calypso/state/posts/counts/selectors';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getReaderFollowForFeed } from 'calypso/state/reader/follows/selectors';
import { isSiteBlocked } from 'calypso/state/reader/site-blocks/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import EmptyContent from './empty';

// If the blog_ID of a reader feed is 0, that means no site exists for it.
const getReaderSiteId = ( feed ) => ( feed && feed.blog_ID === 0 ? null : feed && feed.blog_ID );

const emptyContent = () => <EmptyContent />;

const FeedStream = ( props ) => {
	const { className = 'is-site-stream', feedId } = props;
	const translate = useTranslate();
	let feed = useSelector( ( state ) => getFeed( state, feedId ) );
	const siteId = getReaderSiteId( feed );
	const followForFeed = useSelector( ( state ) =>
		getReaderFollowForFeed( state, parseInt( feedId ) )
	);
	const isBlocked = useSelector( ( state ) => siteId && isSiteBlocked( state, siteId ) );
	const postCount = useSelector(
		( state ) => siteId && getAllPostCount( state, siteId, 'post', 'publish' )
	);
	const site = useSelector( ( state ) => siteId && getSite( state, siteId ) );

	if ( feed ) {
		// Add site icon to feed object so have icon for external feeds
		feed = { ...feed, site_icon: followForFeed?.site_icon };
	}

	const siteTags = useSiteTags( siteId );
	const title = getSiteName( { feed, site } ) || translate( 'Loading Feed' );
	const followerCount = getFollowerCount( feed, site );

	if ( isBlocked ) {
		return <SiteBlocked title={ title } siteId={ siteId } />;
	}

	if ( ( feed && feed.is_error ) || ( site && site.is_error ) ) {
		return <FeedError sidebarTitle={ title } />;
	}

	const streamSidebar = () => (
		<FeedStreamSidebar
			feed={ feed }
			followerCount={ followerCount }
			postCount={ postCount }
			showFollow={ props.width > 900 }
			site={ site }
			streamKey={ props.streamKey }
			tags={ siteTags.data }
		/>
	);

	return (
		<Stream
			{ ...props }
			className={ className }
			emptyContent={ emptyContent }
			listName={ title }
			showFollowButton={ false }
			showSiteNameOnCards={ false }
			sidebarTabTitle={ translate( 'Related' ) }
			streamSidebar={ streamSidebar }
			useCompactCards
		>
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: title,
					comment: '%s is the section name. For example: "My Likes"',
				} ) }
			/>
			<ReaderFeedHeader
				feed={ feed }
				site={ site }
				showBack={ false }
				streamKey={ props.streamKey }
			/>
			{ siteId && <QueryPostCounts siteId={ siteId } type="post" /> }
			{ ! feed && <QueryReaderFeed feedId={ feedId } /> }
			{ siteId && <QueryReaderSite siteId={ siteId } /> }
		</Stream>
	);
};

export default withDimensions( FeedStream );
