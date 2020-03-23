/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { cancelConciergeAppointment } from '../';
import { updateConciergeBookingStatus } from 'state/concierge/actions';
import { CONCIERGE_APPOINTMENT_CANCEL } from 'state/action-types';
import { CONCIERGE_STATUS_CANCELLING } from 'me/concierge/constants';

// we are mocking impure-lodash here, so that conciergeShiftsFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
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
