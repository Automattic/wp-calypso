/**
 * Internal dependencies
 */

import getTimezonesLabels from 'state/selectors/get-timezones-labels';

/**
 * Return timezone `label` according to the given timezone key (value)
 *
 * @param {object}  state - Global state tree
 * @param {string} key - timezone value
 * @returns {string} the timezone label
 */
export default function getTimezonesLabel( state, key ) {
	const labels = getTimezonesLabels( state );
	return labels[ key ] ? labels[ key ] : null;
}
