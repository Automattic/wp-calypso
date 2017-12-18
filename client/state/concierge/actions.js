/** @format */

/**
 * Internal dependencies
 */
import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
} from 'state/action-types';

export const requestConciergeAvailableTimes = scheduleId => ( {
	type: CONCIERGE_AVAILABLE_TIMES_REQUEST,
	scheduleId,
} );

export const updateConciergeAvailableTimes = availableTimes => ( {
	type: CONCIERGE_AVAILABLE_TIMES_UPDATE,
	availableTimes,
} );
