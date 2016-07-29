/**
* Returns true if we should fetch the feed
*
* @param  {Object}  state  Global state tree
* @param  {Number}  feedId The feed ID
* @return {Boolean} Whether feed should be fetched
*/

export function shouldFeedBeFetched( state, feedId ) {
	const
		currentlyQueued = state.reader.feeds.queuedRequests[ feedId ],
		currentlyLoaded = state.reader.feeds.items[ feedId ];

	return ! currentlyQueued && ! currentlyLoaded;
}

/**
* Returns a feed object
*
* @param  {Object}  state  Global state tree
* @param  {Number}  feedId The feed ID
* @return {Object}  Feed
*/

export function getFeed( state, feedId ) {
	return state.reader.feeds.items[ feedId ];
}
