/**
 * External dependencies
 */
import { values, reject } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';

import 'state/reader/init';

/*
 * Get all sites/feeds the user follows.
 *
 * @param  {object}  state  Global state tree
 * @returns {Array} Followed sites/feeds
 */
const getReaderFollows = createSelector(
	( state ) => {
		// remove subs where the sub has an error
		const items = reject( values( state.reader.follows.items ), 'error' );

		// this is important. don't mutate the original items.
		const withSiteAndFeed = items.map( ( item ) => ( {
			...item,
			site: getSite( state, item.blog_ID ),
			feed: getFeed( state, item.feed_ID ),
		} ) );

		// remove subs where the feed or site has an error
		const withoutErrors = reject(
			withSiteAndFeed,
			( item ) =>
				( item.site && item.site.is_error && item.site.error.statusCode === 410 ) ||
				( item.feed && item.feed.is_error )
		);
		return withoutErrors;
	},
	( state ) => [
		state.reader.follows.items,
		state.reader.feeds.items,
		state.reader.sites.items,
		state.currentUser.capabilities,
	]
);

export default getReaderFollows;
