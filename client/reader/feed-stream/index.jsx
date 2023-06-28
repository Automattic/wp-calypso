import { useTranslate } from 'i18n-calypso';
import ReaderFeedHeader from 'calypso/blocks/reader-feed-header';
import DocumentHead from 'calypso/components/data/document-head';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import FeedError from 'calypso/reader/feed-error';
import { getSiteName } from 'calypso/reader/get-helpers';
import SiteBlocked from 'calypso/reader/site-blocked';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getReaderFollowForFeed } from 'calypso/state/reader/follows/selectors';
import { isSiteBlocked } from 'calypso/state/reader/site-blocks/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import EmptyContent from './empty';

// If the blog_ID of a reader feed is 0, that means no site exists for it.
const getReaderSiteId = ( feed ) => ( feed && feed.blog_ID === 0 ? null : feed && feed.blog_ID );

export default function FeedStream( props ) {
	const { feedId, className = 'is-site-stream', showBack = true } = props;
	const translate = useTranslate();

	const feed = useSelector( ( state ) => {
		const _feed = getFeed( state, feedId );

		if ( _feed ) {
			// Add site icon to feed object so have icon for external feeds
			_feed.site_icon = getReaderFollowForFeed( state, parseInt( feedId ) )?.site_icon;
		}

		return _feed;
	} );

	const { isBlocked, site, siteId } = useSelector( ( state ) => {
		const _siteId = getReaderSiteId( feed );

		return {
			isBlocked: _siteId && isSiteBlocked( state, _siteId ),
			site: _siteId && getSite( state, _siteId ),
			siteId: _siteId,
		};
	} );

	const emptyContent = <EmptyContent />;
	const title = getSiteName( { feed, site } ) || translate( 'Loading Feed' );

	if ( isBlocked ) {
		return <SiteBlocked title={ title } siteId={ siteId } />;
	}

	if ( ( feed && feed.is_error ) || ( site && site.is_error ) ) {
		return <FeedError sidebarTitle={ title } />;
	}

	return (
		<Stream
			{ ...props }
			className={ className }
			listName={ title }
			emptyContent={ emptyContent }
			showPostHeader={ false }
			showSiteNameOnCards={ false }
			useCompactCards={ true }
			showFollowButton={ false }
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
				showBack={ showBack }
				streamKey={ props.streamKey }
			/>
			{ ! feed && <QueryReaderFeed feedId={ feedId } /> }
			{ siteId && <QueryReaderSite siteId={ siteId } /> }
		</Stream>
	);
}
