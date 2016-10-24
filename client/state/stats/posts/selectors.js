import get from 'lodash/get';

/**
 * Returns true if current requesting post stat for the specified site ID,
 * post ID and stat key, or * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  stat   Stat Key
 * @param  {Number}  siteId Site ID
 * @param  {Number}  postId Post Id
 * @return {Boolean}        Whether post stat is being requested
 */
export function isRequestingPostStat( state, stat, siteId, postId ) {
	return get( state.stats.posts.requesting, [ siteId, postId, stat ], false );
}

/**
 * Returns the stat value for the specified site ID,
 * post ID and stat key
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  stat   Stat Key
 * @param  {Number}  siteId Site ID
 * @param  {Number}  postId Post Id
 * @return {?Number}        Stat value
 */
export function getPostStat( state, stat, siteId, postId ) {
	return get( state.stats.posts.items, [ siteId, postId, stat ], null );
}
