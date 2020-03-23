/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Return manual utc offsets data
 * gotten from state.timezones subtree.
 *
 * @param  {object} state - Global state tree
 * @returns {?Array} An array of manual offset timezones
 */
export default function getRawOffsets( state ) {
	return get( state, 'timezones.rawOffsets', null );
}
