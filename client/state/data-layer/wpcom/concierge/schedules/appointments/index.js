/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { updateConciergeAppointmentDetails } from 'state/concierge/actions';
import { CONCIERGE_APPOINTMENT_DETAILS_REQUEST } from 'state/action-types';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import fromApi from './from-api';
import bookHandlers from './book';
import cancelHandlers from './cancel';
import rescheduleHandlers from './reschedule';

export const fetchAppointmentDetails = ( { dispatch }, action ) => {
	const { appointmentId, scheduleId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/concierge/schedules/${ scheduleId }/appointments/${ appointmentId }/detail`,
				apiNamespace: 'wpcom/v2',
				retryPolicy: noRetry(),
			},
			action
		)
	);
};

export const storeFetchedAppointmentDetails = ( { dispatch }, action, appointmentDetails ) => {
	dispatch( updateConciergeAppointmentDetails( appointmentDetails ) );
};

export const showAppointmentDetailsFetchError = ( { dispatch } ) => {
	dispatch(
		errorNotice( translate( 'We could not find your appointment. Please try again later.' ) )
	);
};

export default mergeHandlers(
	{
		[ CONCIERGE_APPOINTMENT_DETAILS_REQUEST ]: [
			dispatchRequest(
				fetchAppointmentDetails,
				storeFetchedAppointmentDetails,
				showAppointmentDetailsFetchError,
				{ fromApi }
			),
		],
	},
	bookHandlers,
	cancelHandlers,
	rescheduleHandlers
);
