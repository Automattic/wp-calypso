/**
 * Internal dependencies
 */
import {
	CONCIERGE_APPOINTMENT_CANCEL,
	CONCIERGE_APPOINTMENT_CREATE,
	CONCIERGE_APPOINTMENT_DETAILS_REQUEST,
	CONCIERGE_APPOINTMENT_DETAILS_UPDATE,
	CONCIERGE_APPOINTMENT_RESCHEDULE,
	CONCIERGE_INITIAL_REQUEST,
	CONCIERGE_INITIAL_UPDATE,
	CONCIERGE_SIGNUP_FORM_UPDATE,
	CONCIERGE_UPDATE_BOOKING_STATUS,
} from 'state/action-types';

import 'state/data-layer/wpcom/concierge';
import 'state/data-layer/wpcom/concierge/initial';

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

export const requestConciergeInitial = ( siteId ) => ( {
	type: CONCIERGE_INITIAL_REQUEST,
	siteId,
} );

export const updateConciergeInitial = ( initial ) => ( {
	type: CONCIERGE_INITIAL_UPDATE,
	initial,
} );

export const updateConciergeSignupForm = ( signupForm ) => ( {
	type: CONCIERGE_SIGNUP_FORM_UPDATE,
	signupForm,
} );

export const updateConciergeBookingStatus = ( status ) => ( {
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
