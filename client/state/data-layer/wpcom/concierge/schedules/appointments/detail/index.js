/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { updateConciergeAppointmentDetails } from 'state/concierge/actions';
import { CONCIERGE_APPOINTMENT_DETAILS_REQUEST } from 'state/action-types';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import fromApi from './from-api';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetchAppointmentDetails = ( action ) => {
	const { appointmentId, scheduleId } = action;

	return http(
		{
			method: 'GET',
			path: `/concierge/schedules/${ scheduleId }/appointments/${ appointmentId }/detail`,
			apiNamespace: 'wpcom/v2',
			retryPolicy: noRetry(),
		},
		action
	);
};

export const onSuccess = ( { appointmentId }, appointmentDetails ) =>
	updateConciergeAppointmentDetails( appointmentId, appointmentDetails );

export const onError = () =>
	errorNotice( translate( 'We could not find your appointment. Please try again later.' ) );

registerHandlers( 'state/data-layer/wpcom/concierge/schedules/appointments/detail/index.js', {
	[ CONCIERGE_APPOINTMENT_DETAILS_REQUEST ]: [
		dispatchRequest( { fetch: fetchAppointmentDetails, onSuccess, onError, fromApi } ),
	],
} );

export default {};
