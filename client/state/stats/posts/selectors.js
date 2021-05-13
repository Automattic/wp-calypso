/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/stats/init';

/**
 * Returns true if current requesting post stat for the specified site ID,
 * post ID and stat key, or * false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @param  {object}  fields Stat fields
 * @returns {boolean}        Whether post stat is being requested
 */
export function isRequestingPostStats( state, siteId, postId, fields = [] ) {
	return get( state.stats.posts.requesting, [ siteId, postId, fields.join() ], false );
}

/**
 * Returns the stat value for the specified site ID,
 * post ID and stat key
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @param  {string}  stat   Stat Key
 * @returns {*}              Stat value
 */
export function getPostStat( state, siteId, postId, stat ) {
	return get( state.stats.posts.items, [ siteId, postId, stat ], null );
}

/**
 * Returns the stats for the for the specified site ID, postId
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post Id
 * @returns {object}         Stats
 */
export function getPostStats( state, siteId, postId ) {
	return get( state.stats.posts.items, [ siteId, postId ], null );
}
