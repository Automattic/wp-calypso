import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import ReaderFeedHeader from 'calypso/blocks/reader-feed-header';
import DocumentHead from 'calypso/components/data/document-head';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import FeedError from 'calypso/reader/feed-error';
import SiteBlocked from 'calypso/reader/site-blocked';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { isSiteBlocked } from 'calypso/state/reader/site-blocks/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import EmptyContent from './empty';

export default function SiteStream( props ) {
	const { className = 'is-site-stream', showBack = true, siteId } = props;
	const translate = useTranslate();

	const { feed, isBlocked, site } = useSelector( ( state ) => {
		const _site = getSite( state, siteId );
		return {
			site: _site,
			feed: _site && _site.feed_ID && getFeed( state, _site.feed_ID ),
			isBlocked: isSiteBlocked( state, siteId ),
		};
	} );

	// check for redirect
	useEffect( () => {
		if ( site && site.prefer_feed && site.feed_ID ) {
			page.replace( '/read/feeds/' + site.feed_ID );
		}
	}, [ site ] );

	const emptyContent = <EmptyContent />;
	const title = site ? site.name : translate( 'Loading Site' );

	if ( isBlocked ) {
		return <SiteBlocked title={ title } siteId={ siteId } />;
	}

	if ( ( site && site.is_error ) || ( feed && feed.is_error ) ) {
		return <FeedError sidebarTitle={ title } />;
	}

	return (
		<Stream
			{ ...props }
			className={ className }
			emptyContent={ emptyContent }
			listName={ title }
			showFollowButton={ false }
			showPostHeader={ false }
			showSiteNameOnCards={ false }
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
			{ ! site && <QueryReaderSite siteId={ props.siteId } /> }
			{ ! feed && site && site.feed_ID && <QueryReaderFeed feedId={ site.feed_ID } /> }
		</Stream>
	);
}
