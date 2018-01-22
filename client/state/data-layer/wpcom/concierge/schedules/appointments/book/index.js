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
import { CONCIERGE_APPOINTMENT_CREATE } from 'state/action-types';
import {
	CONCIERGE_STATUS_BOOKED,
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKING_ERROR,
	CONCIERGE_ERROR_NO_AVAILABLE_STAFF,
} from 'me/concierge/constants';
import fromApi from './from-api';
import toApi from './to-api';

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
	[ CONCIERGE_APPOINTMENT_CREATE ]: [
		dispatchRequest( bookConciergeAppointment, markSlotAsBooked, handleBookingError, { fromApi } ),
	],
};
