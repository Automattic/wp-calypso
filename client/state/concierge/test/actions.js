/** @format */

/**
 * Internal dependencies
 */
import {
	bookConciergeAppointment,
	requestConciergeAvailableTimes,
	updateConciergeAvailableTimes,
	updateConciergeBookingStatus,
	updateConciergeSignupForm,
} from '../actions';

import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
	CONCIERGE_APPOINTMENT_CREATE,
	CONCIERGE_SIGNUP_FORM_UPDATE,
	CONCIERGE_UPDATE_BOOKING_STATUS,
} from 'state/action-types';

describe( 'state/concierge', () => {
	describe( 'actions', () => {
		test( 'bookConciergeAppointment()', () => {
			const scheduleId = 123;
			const beginTimestamp = 1234567890;
			const customerId = 1;
			const siteId = 2;
			const meta = { test: 'testing' };

			expect(
				bookConciergeAppointment( scheduleId, beginTimestamp, customerId, siteId, meta )
			).toEqual( {
				type: CONCIERGE_APPOINTMENT_CREATE,
				scheduleId,
				beginTimestamp,
				customerId,
				siteId,
				meta,
			} );
		} );

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

		test( 'updateConciergeSignupForm()', () => {
			const signupForm = { timezone: 'UTC', message: 'hello there' };

			expect( updateConciergeSignupForm( signupForm ) ).toEqual( {
				type: CONCIERGE_SIGNUP_FORM_UPDATE,
				signupForm,
			} );
		} );

		test( 'updateConciergeBookingStatus()', () => {
			const status = 'booking';

			expect( updateConciergeBookingStatus( status ) ).toEqual( {
				type: CONCIERGE_UPDATE_BOOKING_STATUS,
				status,
			} );
		} );
	} );
} );
