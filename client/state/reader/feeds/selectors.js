

/**
* Returns true if we should fetch the feed
*
* @param  {Object}  state  Global state tree
* @param  {Number}  feedId The feed ID
* @return {Boolean}        Whether feed should be fetched
*/

export function shouldFeedBeFetched( state, feedId ) {
	return ! state.reader.feeds.queuedRequests[ feedId ] && // not currently queued
		! state.reader.feeds.items[ feedId ]; // not currently loaded
}
