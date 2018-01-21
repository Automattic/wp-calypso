/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { updateConciergeBookingStatus } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import {
	CONCIERGE_APPOINTMENT_CANCEL,
	CONCIERGE_APPOINTMENT_CREATE,
	CONCIERGE_APPOINTMENT_RESCHEDULE,
} from 'state/action-types';
import {
	CONCIERGE_STATUS_BOOKED,
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKING_ERROR,
	CONCIERGE_STATUS_CANCELLED,
	CONCIERGE_STATUS_CANCELLING,
	CONCIERGE_STATUS_CANCELLING_ERROR,
	CONCIERGE_ERROR_NO_AVAILABLE_STAFF,
} from 'me/concierge/constants';
import fromApi from './from-api';

export const toApi = ( { beginTimestamp, customerId, siteId, meta } ) => ( {
	begin_timestamp: beginTimestamp / 1000, // convert to UNIX timestamp.
	customer_id: customerId,
	site_id: siteId,
	meta: JSON.stringify( meta ),
} );

export const cancelConciergeAppointment = ( { dispatch }, action ) => {
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_CANCELLING ) );

	dispatch(
		http(
			{
				method: 'POST',
				path: `/concierge/schedules/${ action.scheduleId }/appointments/${
					action.appointmentId
				}/cancel`,
				apiNamespace: 'wpcom/v2',
				body: {},
			},
			action
		)
	);
};

export const markSlotAsCancelled = ( { dispatch } ) =>
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_CANCELLED ) );

export const handleCancellingError = ( { dispatch } ) =>
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_CANCELLING_ERROR ) );

export const bookConciergeAppointment = ( { dispatch }, action ) => {
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING ) );

	dispatch(
		http(
			{
				method: 'POST',
				path: `/concierge/schedules/${ action.scheduleId }/appointments`,
				apiNamespace: 'wpcom/v2',
				body: toApi( action ),
			},
			action
		)
	);
};

export const rescheduleConciergeAppointment = ( { dispatch }, action ) => {
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING ) );

	dispatch(
		http(
			{
				method: 'POST',
				path: `/concierge/schedules/${ action.scheduleId }/appointments/${
					action.appointmentId
				}/reschedule`,
				apiNamespace: 'wpcom/v2',
				body: {
					begin_timestamp: action.beginTimestamp / 1000, // convert to UNIX timestamp.
				},
			},
			action
		)
	);
};

export const markSlotAsBooked = ( { dispatch } ) =>
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKED ) );

export const handleBookingError = ( { dispatch }, action, error ) => {
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING_ERROR ) );

	let errorMessage;
	switch ( error.code ) {
		case CONCIERGE_ERROR_NO_AVAILABLE_STAFF:
			errorMessage = translate(
				'This session is no longer available. Please select a different time.'
			);
			break;

		default:
			errorMessage = translate( 'We could not book your appointment. Please try again later.' );
			break;
	}

	dispatch( errorNotice( errorMessage ) );
};

export default {
	[ CONCIERGE_APPOINTMENT_CANCEL ]: [
		dispatchRequest( cancelConciergeAppointment, markSlotAsCancelled, handleCancellingError, {
			fromApi,
		} ),
	],
	[ CONCIERGE_APPOINTMENT_CREATE ]: [
		dispatchRequest( bookConciergeAppointment, markSlotAsBooked, handleBookingError, { fromApi } ),
	],
	[ CONCIERGE_APPOINTMENT_RESCHEDULE ]: [
		dispatchRequest( rescheduleConciergeAppointment, markSlotAsBooked, handleBookingError, {
			fromApi,
		} ),
	],
};
