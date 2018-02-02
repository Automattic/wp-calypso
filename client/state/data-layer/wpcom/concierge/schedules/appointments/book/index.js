/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { updateConciergeBookingStatus } from 'state/concierge/actions';
import { errorNotice } from 'state/notices/actions';
import { CONCIERGE_APPOINTMENT_CREATE, CONCIERGE_APPOINTMENT_RESCHEDULE } from 'state/action-types';
import {
	CONCIERGE_STATUS_BOOKED,
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKING_ERROR,
	CONCIERGE_ERROR_NO_AVAILABLE_STAFF,
} from 'me/concierge/constants';
import fromApi from './from-api';
import toApi from './to-api';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

export const bookConciergeAppointment = action => {
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

	const errorMessage =
		CONCIERGE_ERROR_NO_AVAILABLE_STAFF === error.code
			? translate( 'This session is no longer available. Please select a different time.' )
			: translate( 'We could not book your appointment. Please try again later.' );

	return [
		withAnalytics(
			recordTracksEvent( trackEvent ),
			updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING_ERROR )
		),
		errorNotice( errorMessage ),
	];
};

export default {
	[ CONCIERGE_APPOINTMENT_CREATE ]: [
		dispatchRequestEx( { fetch: bookConciergeAppointment, onSuccess, onError, fromApi } ),
	],
};
