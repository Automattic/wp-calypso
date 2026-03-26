import { find } from 'lodash';

import 'calypso/state/reader/init';

/**
 * Returns a feed object
 * @param  {Object}  state  Global state tree
 * @param  {number}  feedId The feed ID
 * @returns {Object}        Feed
 */

export function getFeed( state, feedId ) {
	return state.reader.feeds.items[ feedId ];
}

export function getFeedByFeedUrl( state, feedUrl ) {
	return find( state.reader.feeds.items, { feed_URL: feedUrl } );
}
