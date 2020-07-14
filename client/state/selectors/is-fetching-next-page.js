/**
 * Internal dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if media is being requested for a specified site ID and query.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}           True if media is being requested
 */
export default function isFetchingNextPage( state, siteId ) {
	return get( state.media.fetching, [ siteId, 'nextPage' ], false );
}
