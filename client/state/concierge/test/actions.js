/** @format */

/**
 * Internal dependencies
 */
import {
	requestConciergeAvailableTimes,
	updateConciergeAvailableTimes,
	requestMakeAppointment,
	requestMakeAppointmentSuccess,
} from '../actions';

import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
	CONCIERGE_MAKE_APPOINTMENT_REQUEST,
	CONCIERGE_MAKE_APPOINTMENT_SUCCESS,
} from 'state/action-types';

describe( 'state/concierge', () => {
	describe( 'actions', () => {
		test( 'requestConciergeAvailableTimes()', () => {
			const scheduleId = 123;

			expect( requestConciergeAvailableTimes( scheduleId ) ).toEqual( {
				type: CONCIERGE_AVAILABLE_TIMES_REQUEST,
				scheduleId,
			} );
		} );

		test( 'updateConciergeAvailableTimes()', () => {
			const availableTimes = [ 111, 222, 333 ];

			expect( updateConciergeAvailableTimes( availableTimes ) ).toEqual( {
				type: CONCIERGE_AVAILABLE_TIMES_UPDATE,
				availableTimes,
			} );
		} );

		test( 'requestMakeAppointment()', () => {
			const scheduleId = 123;
			const beginTimestamp = Date.parse( '2017-01-05' );
			const customerId = 9527;
			const siteId = 119922;
			const meta = {
				description: 'hey ya!',
			};

			expect(
				requestMakeAppointment( scheduleId, beginTimestamp, customerId, siteId, meta )
			).toEqual( {
				type: CONCIERGE_MAKE_APPOINTMENT_REQUEST,
				scheduleId,
				beginTimestamp,
				customerId,
				siteId,
				meta,
			} );
		} );

		test( 'requestMakeAppointmentSuccess()', () => {
			expect( requestMakeAppointmentSuccess() ).toEqual( {
				type: CONCIERGE_MAKE_APPOINTMENT_SUCCESS,
			} );
		} );
	} );
} );
