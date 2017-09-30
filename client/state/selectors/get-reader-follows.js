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

/*
 * Get all sites/feeds the user follows.
 *
 * @param  {Object}  state  Global state tree
 * @return {Array} Followed sites/feeds
 */
const getReaderFollows = createSelector(
	state => {
		const items = reject( values( state.reader.follows.items ), 'error' );
		// this is important. don't mutate the original items.
		return items.map( item => ( {
			...item,
			site: getSite( state, item.blog_ID ),
			feed: getFeed( state, item.feed_ID ),
		} ) );
	},
	state => [ state.reader.follows.items, state.reader.feeds.items, state.reader.sites.items, state.currentUser.capabilities ]
);

export default getReaderFollows;
