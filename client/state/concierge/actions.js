/** @format */

/**
 * Internal dependencies
 */
import {
	CONCIERGE_SHIFTS_FETCH,
	CONCIERGE_SHIFTS_FETCH_FAILED,
	CONCIERGE_SHIFTS_FETCH_SUCCESS,
} from 'state/action-types';

export const fetchConciergeShifts = scheduleId => ( {
	type: CONCIERGE_SHIFTS_FETCH,
	scheduleId,
} );

export const fetchConciergeShiftsFailed = error => ( {
	type: CONCIERGE_SHIFTS_FETCH_FAILED,
	error,
} );

export const fetchConciergeShiftsSuccess = shifts => ( {
	type: CONCIERGE_SHIFTS_FETCH_SUCCESS,
	shifts,
} );
