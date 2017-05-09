/**
* Returns true if we should fetch the feed
*
* @param  {Object}  state  Global state tree
* @param  {Number}  feedId The feed ID
* @return {Boolean}        Whether feed should be fetched
*/

const DAY_IN_MILLIS = 24 * 60 * 1000 * 1000;

export function shouldFeedBeFetched( state, feedId ) {
	// we should fetch the feed if we don't have it,
	// or we do have it
	// and it's been more than a day since we last fetched, and it's not already queued to be fetched
	return ! state.reader.feeds.queuedRequests[ feedId ] &&
		(
			! getFeed( state, feedId ) ||
			! lastUpdatedWithin( state, feedId, DAY_IN_MILLIS )
		);
}

function lastUpdatedWithin( state, feedId, timeInMillis ) {
	const lastUpdated = state.reader.feeds.lastUpdated[ feedId ];
	if ( ! lastUpdated ) {
		return false;
	}
	return lastUpdated > ( Date.now() - timeInMillis );
}

/**
 * Get the feed object for the given feed id
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} feedId The feed ID
 * @return {Object}        The feed object
 */
export function getFeed( state, feedId ) {
	return state.reader.feeds.items[ feedId ];
}
