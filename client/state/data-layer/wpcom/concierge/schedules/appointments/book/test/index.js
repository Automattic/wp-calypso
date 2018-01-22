/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { bookConciergeAppointment, handleBookingError, markSlotAsBooked } from '../';
import toApi from '../to-api';
import { updateConciergeBookingStatus } from 'state/concierge/actions';
import { CONCIERGE_APPOINTMENT_CREATE } from 'state/action-types';
import { CONCIERGE_STATUS_BOOKING_ERROR } from 'me/concierge/constants';

// we are mocking impure-lodash here, so that conciergeShiftsFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'bookConciergeAppointment()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_APPOINTMENT_CREATE,
				scheduleId: 123,
				beginTimestamp: 1234567890,
				customerId: 1,
				siteId: 2,
				meta: { test: 'json' },
			};

			bookConciergeAppointment( { dispatch }, action );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'POST',
						path: `/concierge/schedules/${ action.scheduleId }/appointments`,
						apiNamespace: 'wpcom/v2',
						body: toApi( action ),
					},
					action
				)
			);
		} );

		test( 'markSlotAsBooked()', () => {
			const dispatch = jest.fn();

			markSlotAsBooked( { dispatch }, {}, true );

			expect( dispatch ).toHaveBeenCalledWith( updateConciergeBookingStatus( 'booked' ) );
		} );

		test( 'handleBookingError()', () => {
			const dispatch = jest.fn();

			handleBookingError( { dispatch }, {}, { code: 'error' } );

			expect( dispatch ).toHaveBeenCalledWith(
				updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING_ERROR )
			);
		} );
	} );
} );
