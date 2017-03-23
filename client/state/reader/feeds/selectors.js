/**
* Returns true if we should fetch the feed
*
* @param  {Object}  state  Global state tree
* @param  {Number}  feedId The feed ID
* @return {Boolean}        Whether feed should be fetched
*/

export function shouldFeedBeFetched(state, feedId) {
    return !state.reader.feeds.queuedRequests[feedId] && !state.reader.feeds.items[feedId]; // not currently queued // not currently loaded
}

/**
 * Get the feed object for the given feed id
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} feedId The feed ID
 * @return {Object}        The feed object
 */
export function getFeed(state, feedId) {
    return state.reader.feeds.items[feedId];
}
