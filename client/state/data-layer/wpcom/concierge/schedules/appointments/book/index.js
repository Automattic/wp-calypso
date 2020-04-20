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
import { CONCIERGE_APPOINTMENT_CREATE, CONCIERGE_APPOINTMENT_RESCHEDULE } from 'state/action-types';
import {
	CONCIERGE_STATUS_BOOKED,
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKING_ERROR,
	CONCIERGE_ERROR_NO_AVAILABLE_STAFF,
	CONCIERGE_ERROR_ALREADY_HAS_APPOINTMENT,
} from 'me/concierge/constants';
import fromApi from './from-api';
import toApi from './to-api';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const bookConciergeAppointment = ( action ) => {
	return [
		updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING ),
		http(
			{
				method: 'POST',
				path: `/concierge/schedules/${ action.scheduleId }/appointments`,
				apiNamespace: 'wpcom/v2',
				body: toApi( action ),
			},
			action
		),
	];
};

export const errorMessage = ( code ) => {
	switch ( code ) {
		case CONCIERGE_ERROR_NO_AVAILABLE_STAFF:
			return translate( 'This session is no longer available. Please select a different time.' );
		case CONCIERGE_ERROR_ALREADY_HAS_APPOINTMENT:
			return translate(
				'You already have an upcoming appointment. A second can not be scheduled yet.'
			);
		default:
			return translate( 'We could not book your appointment. Please try again later.' );
	}
};

export const onSuccess = ( { type } ) => {
	const trackEvent =
		CONCIERGE_APPOINTMENT_RESCHEDULE === type
			? 'calypso_concierge_appointment_rescheduling_successful'
			: 'calypso_concierge_appointment_booking_successful';

	return withAnalytics(
		recordTracksEvent( trackEvent ),
		updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKED )
	);
};

export const onError = ( { type }, error ) => {
	const trackEvent =
		CONCIERGE_APPOINTMENT_RESCHEDULE === type
			? 'calypso_concierge_appointment_rescheduling_error'
			: 'calypso_concierge_appointment_booking_error';

	return [
		withAnalytics(
			recordTracksEvent( trackEvent ),
			updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING_ERROR )
		),
		errorNotice( errorMessage( error.code ) ),
	];
};

registerHandlers( 'state/data-layer/wpcom/concierge/schedules/appointments/book/index.js', {
	[ CONCIERGE_APPOINTMENT_CREATE ]: [
		dispatchRequest( { fetch: bookConciergeAppointment, onSuccess, onError, fromApi } ),
	],
} );

export default {};
