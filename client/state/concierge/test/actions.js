/** @format */

/**
 * Internal dependencies
 */
import {
	fetchConciergeShifts,
	fetchConciergeShiftsFailed,
	fetchConciergeShiftsSuccess,
} from '../actions';

import {
	CONCIERGE_SHIFTS_FETCH,
	CONCIERGE_SHIFTS_FETCH_FAILED,
	CONCIERGE_SHIFTS_FETCH_SUCCESS,
} from 'state/action-types';

describe( 'state/concierge', () => {
	describe( 'actions', () => {
		test( 'fetchConciergeShifts()', () => {
			const scheduleId = 123;

			expect( fetchConciergeShifts( scheduleId ) ).toEqual( {
				type: CONCIERGE_SHIFTS_FETCH,
				scheduleId,
			} );
		} );

		test( 'fetchConciergeShiftsFailed()', () => {
			const error = {
				status: 400,
				message: 'something wrong!',
			};

			expect( fetchConciergeShiftsFailed( error ) ).toEqual( {
				type: CONCIERGE_SHIFTS_FETCH_FAILED,
				error,
			} );
		} );

		test( 'fetchConciergeShiftsSuccess()', () => {
			const shifts = [
				{
					begin_timestamp: 100,
					end_timestamp: 300,
					schedule_id: 123,
					description: 'lovely shift 1',
				},
				{
					begin_timestamp: 200,
					end_timestamp: 400,
					schedule_id: 123,
					description: 'cute shift 2',
				},
			];

			expect( fetchConciergeShiftsSuccess( shifts ) ).toEqual( {
				type: CONCIERGE_SHIFTS_FETCH_SUCCESS,
				shifts,
			} );
		} );
	} );
} );
