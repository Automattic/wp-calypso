/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { cancelConciergeAppointment } from '../';
import { updateConciergeBookingStatus } from 'calypso/state/concierge/actions';
import { CONCIERGE_APPOINTMENT_CANCEL } from 'calypso/state/action-types';
import { CONCIERGE_STATUS_CANCELLING } from 'calypso/me/concierge/constants';

// we are mocking uuid.v4 here, so that conciergeShiftsFetchError() will contain the expected id in the tests
jest.mock( 'uuid', () => ( {
	v4: () => 'fake-uuid',
} ) );

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
