/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { updateConciergeBookingStatus } from 'state/concierge/actions';
import { CONCIERGE_APPOINTMENT_RESCHEDULE } from 'state/action-types';
import { CONCIERGE_STATUS_BOOKING } from 'me/concierge/constants';
import fromApi from '../book/from-api';
import { onSuccess, onError } from '../book';
import toApi from './to-api';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const rescheduleConciergeAppointment = ( action ) => {
	return [
		updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING ),
		http(
			{
				method: 'POST',
				path: `/concierge/schedules/${ action.scheduleId }/appointments/${ action.appointmentId }/reschedule`,
				apiNamespace: 'wpcom/v2',
				body: toApi( action ),
			},
			action
		),
	];
};

registerHandlers( 'state/data-layer/wpcom/concierge/schedules/appointments/reschedule/index.js', {
	[ CONCIERGE_APPOINTMENT_RESCHEDULE ]: [
		dispatchRequest( { fetch: rescheduleConciergeAppointment, onSuccess, onError, fromApi } ),
	],
} );

export default {};
