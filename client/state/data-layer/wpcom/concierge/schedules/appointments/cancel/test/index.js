import { CONCIERGE_STATUS_CANCELLING } from 'calypso/me/concierge/constants';
import { CONCIERGE_APPOINTMENT_CANCEL } from 'calypso/state/action-types';
import { updateConciergeBookingStatus } from 'calypso/state/concierge/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { cancelConciergeAppointment } from '../';

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'cancelConciergeAppointment()', () => {
			const action = {
				type: CONCIERGE_APPOINTMENT_CANCEL,
				scheduleId: 123,
				appointmentId: 1,
			};

			expect( cancelConciergeAppointment( action ) ).toEqual( [
				updateConciergeBookingStatus( CONCIERGE_STATUS_CANCELLING ),
				http(
					{
						method: 'POST',
						path: `/concierge/schedules/${ action.scheduleId }/appointments/${ action.appointmentId }/cancel`,
						apiNamespace: 'wpcom/v2',
						body: {},
					},
					action
				),
			] );
		} );
	} );
} );
