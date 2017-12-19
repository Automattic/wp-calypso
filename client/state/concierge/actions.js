/** @format */

/**
 * Internal dependencies
 */
import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
	CONCIERGE_MAKE_APPOINTMENT_REQUEST,
	CONCIERGE_MAKE_APPOINTMENT_SUCCESS,
} from 'state/action-types';

export const requestConciergeAvailableTimes = scheduleId => ( {
	type: CONCIERGE_AVAILABLE_TIMES_REQUEST,
	scheduleId,
} );

export const updateConciergeAvailableTimes = availableTimes => ( {
	type: CONCIERGE_AVAILABLE_TIMES_UPDATE,
	availableTimes,
} );

export const requestMakeAppointment = (
	scheduleId,
	beginTimestamp,
	customerId,
	siteId,
	meta
) => ( {
	type: CONCIERGE_MAKE_APPOINTMENT_REQUEST,
	scheduleId,
	beginTimestamp,
	customerId,
	siteId,
	meta,
} );

export const makeAppointmentSuccess = () => ( {
	type: CONCIERGE_MAKE_APPOINTMENT_SUCCESS,
} );
