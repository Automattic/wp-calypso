/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { rescheduleConciergeAppointment } from '../';
import { updateConciergeBookingStatus } from 'calypso/state/concierge/actions';
import { CONCIERGE_APPOINTMENT_RESCHEDULE } from 'calypso/state/action-types';
import { CONCIERGE_STATUS_BOOKING } from 'calypso/me/concierge/constants';
import toApi from '../to-api';

// we are mocking impure-lodash here, so that conciergeShiftsFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'rescheduleConciergeAppointment()', () => {
			const action = {
				type: CONCIERGE_APPOINTMENT_RESCHEDULE,
				scheduleId: 123,
				appointmentId: 1,
				beginTimestamp: 1234567890,
				appointmentDetails: { meta: { timezone: 'UTC' } },
			};

			expect( rescheduleConciergeAppointment( action ) ).toEqual( [
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
			] );
		} );
	} );
} );
