/**
 * External Dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

const DAY_IN_MILLIS = 24 * 60 * 1000 * 1000;

/**
 * Returns true if we should fetch the feed
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  feedId The feed ID
 * @returns {boolean}        Whether feed should be fetched
 */

export function shouldFeedBeFetched( state, feedId ) {
	const isNotQueued = ! state.reader.feeds.queuedRequests[ feedId ];
	const isMissing = ! getFeed( state, feedId );
	return isNotQueued && ( isMissing || isStale( state, feedId ) );
}

function isStale( state, feedId ) {
	const lastFetched = state.reader.feeds.lastFetched[ feedId ];
	if ( ! lastFetched ) {
		return true;
	}
	return lastFetched <= Date.now() - DAY_IN_MILLIS;
}

/**
 * Returns a feed object
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  feedId The feed ID
 * @returns {object}        Feed
 */

export function getFeed( state, feedId ) {
	return state.reader.feeds.items[ feedId ];
}

export function getFeeds( state ) {
	return state.reader.feeds.items;
}

export function getFeedByFeedUrl( state, feedUrl ) {
	return find( state.reader.feeds.items, { feed_URL: feedUrl } );
}
