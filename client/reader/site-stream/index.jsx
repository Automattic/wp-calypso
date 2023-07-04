import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import ReaderFeedHeader from 'calypso/blocks/reader-feed-header';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPostCounts from 'calypso/components/data/query-post-counts';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { useSiteTags } from 'calypso/data/site-tags/use-site-tags';
import withDimensions from 'calypso/lib/with-dimensions';
import FeedError from 'calypso/reader/feed-error';
import { getFollowerCount } from 'calypso/reader/get-helpers';
import SiteBlocked from 'calypso/reader/site-blocked';
import Stream from 'calypso/reader/stream';
import FeedStreamSidebar from 'calypso/reader/stream/site-feed-sidebar';
import { useSelector } from 'calypso/state';
import { getAllPostCount } from 'calypso/state/posts/counts/selectors';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { isSiteBlocked } from 'calypso/state/reader/site-blocks/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import EmptyContent from './empty';

const SiteStream = ( props ) => {
	const { className = 'is-site-stream', showBack = true, siteId } = props;
	const translate = useTranslate();

	const { feed, isBlocked, postCount, site } = useSelector( ( state ) => {
		const _site = getSite( state, siteId );
		return {
			feed: _site && _site.feed_ID && getFeed( state, _site.feed_ID ),
			isBlocked: isSiteBlocked( state, siteId ),
			postCount: siteId && getAllPostCount( state, siteId, 'post', 'publish' ),
			site: _site,
		};
	} );

	// check for redirect
	useEffect( () => {
		if ( site && site.prefer_feed && site.feed_ID ) {
			page.replace( '/read/feeds/' + site.feed_ID );
		}
	}, [ site ] );

	const siteTags = useSiteTags( siteId );
	const emptyContent = <EmptyContent />;
	const title = site ? site.name : translate( 'Loading Site' );
	const followerCount = getFollowerCount( feed, site );

	if ( isBlocked ) {
		return <SiteBlocked title={ title } siteId={ siteId } />;
	}

	if ( ( site && site.is_error ) || ( feed && feed.is_error ) ) {
		return <FeedError sidebarTitle={ title } />;
	}

	const streamSidebar = (
		<FeedStreamSidebar
			feed={ feed }
			followerCount={ followerCount }
			postCount={ postCount }
			showFollow={ props.width > 900 }
			site={ site }
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
			useCompactCards={ true }
		>
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: title,
					comment: '%s is the section name. For example: "My Likes"',
				} ) }
			/>
			<ReaderFeedHeader
				site={ site }
				feed={ feed }
				showBack={ showBack }
				streamKey={ props.streamKey }
			/>
			{ siteId && <QueryPostCounts siteId={ siteId } type="post" /> }
			{ ! site && <QueryReaderSite siteId={ siteId } /> }
			{ ! feed && site && site.feed_ID && <QueryReaderFeed feedId={ site.feed_ID } /> }
		</Stream>
	);
};

export default withDimensions( SiteStream );
