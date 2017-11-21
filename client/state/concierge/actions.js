/** @format */

/**
 * Internal dependencies
 */
import { CONCIERGE_SHIFTS_REQUEST, CONCIERGE_SHIFTS_UPDATE } from 'state/action-types';

export const requestConciergeShifts = scheduleId => ( {
	type: CONCIERGE_SHIFTS_REQUEST,
	scheduleId,
} );

export const updateConciergeShifts = shifts => ( {
	type: CONCIERGE_SHIFTS_UPDATE,
	shifts,
} );
