/** @format */

/**
 * Internal dependencies
 */
import { requestConciergeShifts, updateConciergeShifts } from '../actions';

import { CONCIERGE_SHIFTS_REQUEST, CONCIERGE_SHIFTS_UPDATE } from 'state/action-types';

describe( 'state/concierge', () => {
	describe( 'actions', () => {
		test( 'requestConciergeShifts()', () => {
			const scheduleId = 123;

			expect( requestConciergeShifts( scheduleId ) ).toEqual( {
				type: CONCIERGE_SHIFTS_REQUEST,
				scheduleId,
			} );
		} );

		test( 'updateConciergeShifts()', () => {
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

			expect( updateConciergeShifts( shifts ) ).toEqual( {
				type: CONCIERGE_SHIFTS_UPDATE,
				shifts,
			} );
		} );
	} );
} );
