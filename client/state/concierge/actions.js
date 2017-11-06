/** @format */

/**
 * Internal dependencies
 */
import { CONCIERGE_SHIFTS_FETCH, CONCIERGE_SHIFTS_UPDATE } from 'state/action-types';

export const fetchConciergeShifts = scheduleId => ( {
	type: CONCIERGE_SHIFTS_FETCH,
	scheduleId,
} );

export const updateConciergeShifts = shifts => ( {
	type: CONCIERGE_SHIFTS_UPDATE,
	shifts,
} );
