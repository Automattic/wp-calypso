/** @format */

/**
 * Internal dependencies
 */
import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
	CONCIERGE_APPOINTMENT_CANCEL,
	CONCIERGE_APPOINTMENT_CREATE,
	CONCIERGE_APPOINTMENT_DETAILS_REQUEST,
	CONCIERGE_APPOINTMENT_DETAILS_UPDATE,
	CONCIERGE_APPOINTMENT_RESCHEDULE,
	CONCIERGE_SIGNUP_FORM_UPDATE,
	CONCIERGE_UPDATE_BOOKING_STATUS,
} from 'state/action-types';

export const requestConciergeAppointmentDetails = ( scheduleId, appointmentId ) => ( {
	type: CONCIERGE_APPOINTMENT_DETAILS_REQUEST,
	scheduleId,
	appointmentId,
} );

export const updateConciergeAppointmentDetails = ( appointmentId, appointmentDetails ) => ( {
	type: CONCIERGE_APPOINTMENT_DETAILS_UPDATE,
	appointmentId,
	appointmentDetails,
} );

export const requestConciergeAvailableTimes = scheduleId => ( {
	type: CONCIERGE_AVAILABLE_TIMES_REQUEST,
	scheduleId,
} );

export const updateConciergeAvailableTimes = availableTimes => ( {
	type: CONCIERGE_AVAILABLE_TIMES_UPDATE,
	availableTimes,
} );

export const updateConciergeSignupForm = signupForm => ( {
	type: CONCIERGE_SIGNUP_FORM_UPDATE,
	signupForm,
} );

export const updateConciergeBookingStatus = status => ( {
	type: CONCIERGE_UPDATE_BOOKING_STATUS,
	status,
} );

export const bookConciergeAppointment = (
	scheduleId,
	beginTimestamp,
	customerId,
	siteId,
	meta
) => ( {
	type: CONCIERGE_APPOINTMENT_CREATE,
	scheduleId,
	beginTimestamp,
	customerId,
	siteId,
	meta,
} );

export const rescheduleConciergeAppointment = (
	scheduleId,
	appointmentId,
	beginTimestamp,
	appointmentDetails
) => ( {
	type: CONCIERGE_APPOINTMENT_RESCHEDULE,
	scheduleId,
	appointmentId,
	beginTimestamp,
	appointmentDetails,
} );

export const cancelConciergeAppointment = ( scheduleId, appointmentId ) => ( {
	type: CONCIERGE_APPOINTMENT_CANCEL,
	scheduleId,
	appointmentId,
} );
