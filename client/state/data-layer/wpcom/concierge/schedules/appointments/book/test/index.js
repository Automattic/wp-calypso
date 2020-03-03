/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { bookConciergeAppointment, onSuccess, onError } from '../';
import toApi from '../to-api';
import { errorNotice } from 'state/notices/actions';
import { updateConciergeBookingStatus } from 'state/concierge/actions';
import { CONCIERGE_APPOINTMENT_CREATE } from 'state/action-types';
import {
	CONCIERGE_STATUS_BOOKED,
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKING_ERROR,
} from 'me/concierge/constants';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

// we are mocking impure-lodash here, so that conciergeShiftsFetchError() will contain the expected id in the tests
jest.mock( 'lib/impure-lodash', () => ( {
	uniqueId: () => 'mock-unique-id',
} ) );

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'bookConciergeAppointment()', () => {
			const action = {
				type: CONCIERGE_APPOINTMENT_CREATE,
				scheduleId: 123,
				beginTimestamp: 1234567890,
				customerId: 1,
				siteId: 2,
				meta: { test: 'json' },
			};

			expect( bookConciergeAppointment( action ) ).toEqual( [
				updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING ),
				http(
					{
						method: 'POST',
						path: `/concierge/schedules/${ action.scheduleId }/appointments`,
						apiNamespace: 'wpcom/v2',
						body: toApi( action ),
					},
					action
				),
			] );
		} );

		test( 'onSuccess()', () => {
			expect( onSuccess( { type: CONCIERGE_APPOINTMENT_CREATE } ) ).toEqual(
				withAnalytics(
					recordTracksEvent( 'calypso_concierge_appointment_booking_successful' ),
					updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKED )
				)
			);
		} );

		test( 'onError()', () => {
			expect( onError( {}, { code: 'error' } ) ).toEqual( [
				withAnalytics(
					recordTracksEvent( 'calypso_concierge_appointment_booking_error' ),
					updateConciergeBookingStatus( CONCIERGE_STATUS_BOOKING_ERROR )
				),
				errorNotice( 'We could not book your appointment. Please try again later.' ),
			] );
		} );
	} );
} );
