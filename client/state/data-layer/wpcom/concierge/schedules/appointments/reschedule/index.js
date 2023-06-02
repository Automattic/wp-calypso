import { CONCIERGE_STATUS_BOOKING } from 'calypso/me/concierge/constants';
import { CONCIERGE_APPOINTMENT_RESCHEDULE } from 'calypso/state/action-types';
import { updateConciergeBookingStatus } from 'calypso/state/concierge/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { onSuccess, onError } from '../book';
import fromApi from '../book/from-api';
import toApi from './to-api';

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
