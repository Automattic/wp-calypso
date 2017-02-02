/**
 * External dependencies
 */
import { map, pickBy } from 'lodash';

/**
 * Returns a list of site IDs blocked by the user
 *
 * @param  {Object}  state  Global state tree
 * @return {Array}        Blocked site IDs
 */
export default function getBlockedSites( state ) {
	return map( Object.keys( pickBy( state.reader.siteBlocks.items ) ), Number );
}
