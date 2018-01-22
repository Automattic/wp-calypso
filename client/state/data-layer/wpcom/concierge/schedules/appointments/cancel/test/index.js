/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { cancelConciergeAppointment } from '../';
import { CONCIERGE_APPOINTMENT_CANCEL } from 'state/action-types';

// we are mocking impure-lodash here, so that conciergeShiftsFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'cancelConciergeAppointment()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_APPOINTMENT_CANCEL,
				scheduleId: 123,
				appointmentId: 1,
			};

			cancelConciergeAppointment( { dispatch }, action );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'POST',
						path: `/concierge/schedules/${ action.scheduleId }/appointments/${
							action.appointmentId
						}/cancel`,
						apiNamespace: 'wpcom/v2',
						body: {},
					},
					action
				)
			);
		} );
	} );
} );
