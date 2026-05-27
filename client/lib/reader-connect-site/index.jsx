import { useSelector } from 'react-redux';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import { useSite } from 'calypso/reader/data/site';
import { getFeed } from 'calypso/state/reader/feeds/selectors';

/**
 * A HoC function that will take in reader identifiers siteId or feedId and
 * pass down all of the fetched data objects they represent
 *
 * It supports two
 * 1. feedId --> feedId, siteId, feed, site
 * 2. blogId --> feedId, siteId, feed, site
 * @param {Object} Component the component to wrap
 * @returns {Object} wrapped component that hands down feed/site to its child
 */
const connectSite = ( Component ) => {
	function ConnectSiteFetcher( ownProps ) {
		const { feedId } = ownProps;
		let { siteId } = ownProps;
		const feedFromProps = useSelector( ( state ) =>
			feedId ? getFeed( state, feedId ) : undefined
		);

		// If the consumer only provided feedId, resolve siteId from the feed.
		if ( feedFromProps && ! siteId ) {
			siteId = feedFromProps.blog_ID !== 0 ? feedFromProps.blog_ID : undefined;
		}

		const { site } = useSite( siteId );

		// If the consumer only provided siteId, resolve feedId from the site.
		const resolvedFeedId = feedId || site?.feed_ID;
		const resolvedFeed = useSelector( ( state ) =>
			resolvedFeedId ? getFeed( state, resolvedFeedId ) : undefined
		);

		return (
			<>
				{ !! resolvedFeedId && <QueryReaderFeed feedId={ resolvedFeedId } /> }
				<Component
					{ ...ownProps }
					feed={ resolvedFeed }
					site={ site }
					siteId={ siteId }
					feedId={ resolvedFeedId }
				/>
			</>
		);
	}
	ConnectSiteFetcher.displayName = `connectSite(${
		Component.displayName || Component.name || 'Component'
	})`;
	return ConnectSiteFetcher;
};

export default connectSite;
