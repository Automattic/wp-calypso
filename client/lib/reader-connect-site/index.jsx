import PropTypes from 'prop-types';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { useSite } from 'calypso/reader/data/site';

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
		const { site: initialSite } = useSite( props.siteId );
		const siteFromPropsOrQuery = props.site ?? initialSite;
		const feedIdFromSite = siteFromPropsOrQuery?.feed_ID;
		const queryFeedId = props.feedId ?? feedIdFromSite;
		const { data: fetchedFeed, isLoading, isError, error } = useFeedQuery( queryFeedId );
		const feed = props.feed ?? fetchedFeed;
		const siteId = props.siteId ?? ( feed && feed.blog_ID !== 0 ? feed.blog_ID : undefined );
		const { site: fetchedSite } = useSite( siteId );
		const site = props.site ?? fetchedSite;
		const feedId = queryFeedId ?? site?.feed_ID;

		return (
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
		);
	};

	ConnectSiteFetcher.propTypes = {
		feed: PropTypes.object,
		feedId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		site: PropTypes.object,
		siteId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	};

	ConnectSiteFetcher.displayName = `connectSite(${
		Component.displayName || Component.name || 'Component'
	})`;
	return ConnectSiteFetcher;
};

export default connectSite;
