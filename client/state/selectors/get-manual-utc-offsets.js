/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return manual utc offsets data
 * gotten from state.timezones subtree.
 *
 * @param  {Object} state - Global state tree
 * @return {?Array} An array of manual offset timezones
 */
export default function getManualUtcOffsets( state ) {
	return get( state, 'timezones.items.manual_utc_offsets', null );
}
