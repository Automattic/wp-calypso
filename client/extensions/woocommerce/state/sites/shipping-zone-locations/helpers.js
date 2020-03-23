/**
 * External dependencies
 */

import { isEmpty } from 'lodash';

/**
 * @param {object} locations The set of locations for the shipping zone.
 * @returns {number} The priority that this shipping zone should have on the list. More specific zones (states, postcode ranges)
 * should appear first in the list. This is the list of priorities:
 * - No locations: Priority 0, it doesn't matter where in the list this zone is
 * - Country + postcode range: Priority 1, highest priority (specificity), these zones must be the first
 * - State(s): Priority 2
 * - Country / countries: Priority 3
 * - Continent / continents: Priority 4, lowest priority, these zones must be the last
 */
export const getZoneLocationsPriority = ( { continent, country, state, postcode } ) => {
	if ( ! isEmpty( continent ) ) {
		return 4;
	} else if ( ! isEmpty( state ) ) {
		return 2;
	} else if ( ! isEmpty( country ) ) {
		return isEmpty( postcode ) ? 3 : 1;
	}
	return 0;
};
