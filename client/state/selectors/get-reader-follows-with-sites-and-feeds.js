/**
 * External dependencies
 */
import { values, filter } from 'lodash';

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
const getReaderFollowsWithSitesAndFeeds = createSelector(
	state => {
		const items = filter( values( state.reader.follows.items ), item => ! item.error );
		items.forEach( item => {
			if ( item.blog_ID ) {
				item.site = getSite( state, item.blog_ID );
			}
			if ( item.feed_ID ) {
				item.feed = getFeed( state, item.feed_ID );
			}
		} );
		return items;
	},
	state => [ state.reader.follows.items, state.reader.feeds.items, state.reader.sites.items ],
);

export default getReaderFollowsWithSitesAndFeeds;
