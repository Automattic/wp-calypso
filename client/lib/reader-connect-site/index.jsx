import PropTypes from 'prop-types';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/reader/sites/selectors';

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
	const ConnectSiteFetcher = ( props ) => {
		const initialSiteFromState = useSelector( ( state ) =>
			props.siteId ? getSite( state, props.siteId ) : undefined
		);
		const initialSite = props.site ?? initialSiteFromState;
		const feedIdFromSite = initialSite?.feed_ID;
		const queryFeedId = props.feedId ?? feedIdFromSite;
		const { data: fetchedFeed, isLoading, isError, error } = useFeedQuery( queryFeedId );
		const feed = props.feed ?? fetchedFeed;
		const siteId = props.siteId ?? ( feed && feed.blog_ID !== 0 ? feed.blog_ID : undefined );
		const siteFromState = useSelector( ( state ) =>
			siteId ? getSite( state, siteId ) : undefined
		);
		const site = props.site ?? siteFromState;
		const feedId = queryFeedId ?? site?.feed_ID;

		return (
			<>
				{ !! siteId && <QueryReaderSite siteId={ siteId } /> }
				<Component
					{ ...props }
					feed={ feed }
					site={ site }
					siteId={ siteId }
					feedId={ feedId }
					isFeedLoading={ isLoading }
					isFeedError={ isError }
					feedError={ error }
				/>
			</>
		);
	};

	ConnectSiteFetcher.propTypes = {
		feed: PropTypes.object,
		feedId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		site: PropTypes.object,
		siteId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	};

	return ConnectSiteFetcher;
};

export default connectSite;
