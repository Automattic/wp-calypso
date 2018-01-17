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
	CONCIERGE_STATUS_CANCELLED,
	CONCIERGE_STATUS_CANCELLING,
	CONCIERGE_STATUS_CANCELLING_ERROR,
} from 'me/concierge/constants';
import fromApi from './from-api';
import analytics from 'lib/analytics';

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

export const markSlotAsCancelled = ( { dispatch } ) => {
	analytics.tracks.recordEvent( 'calypso_concierge_appointment_cancellation_successful' );
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_CANCELLED ) );
};

export const handleCancellingError = ( { dispatch } ) => {
	analytics.tracks.recordEvent( 'calypso_concierge_appointment_cancellation_error' );
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_CANCELLING_ERROR ) );
};

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

export const markSlotAsBooked = ( { dispatch }, action ) => {
	switch ( action.type ) {
		case CONCIERGE_APPOINTMENT_CREATE:
			analytics.tracks.recordEvent( 'calypso_concierge_appointment_booking_successful' );
			break;

		case CONCIERGE_APPOINTMENT_RESCHEDULE:
			analytics.tracks.recordEvent( 'calypso_concierge_appointment_rescheduling_successful' );
			break;
	}
	dispatch( updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKED ) );
};

export const handleBookingError = ( { dispatch }, action ) => {
	switch ( action.type ) {
		case CONCIERGE_APPOINTMENT_CREATE:
			analytics.tracks.recordEvent( 'calypso_concierge_appointment_booking_error' );
			break;

		case CONCIERGE_APPOINTMENT_RESCHEDULE:
			analytics.tracks.recordEvent( 'calypso_concierge_appointment_rescheduling_error' );
			break;
	}

	dispatch( updateConciergeBookingStatus( null ) );
	dispatch(
		errorNotice( translate( 'We could not book your appointment. Please try again later.' ) )
	);
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
