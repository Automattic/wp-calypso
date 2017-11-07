/** @format */

/**
 * Internal dependencies
 */
import { shifts } from '../reducer';
import { CONCIERGE_SHIFTS_FETCH, CONCIERGE_SHIFTS_UPDATE } from 'state/action-types';

describe( 'concierge/shifts/reducer', () => {
	const mockShifts = [ { description: 'shift1' }, { description: 'shift2' } ];

	const fetchAction = {
		type: CONCIERGE_SHIFTS_FETCH,
	};

	const updateAction = {
		type: CONCIERGE_SHIFTS_UPDATE,
		shifts: mockShifts,
	};

	describe( 'shifts', () => {
		test( 'should be defaulted as null.', () => {
			expect( shifts( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the fetch action.', () => {
			const state = mockShifts;
			expect( shifts( state, fetchAction ) ).toBeNull();
		} );

		test( 'should be the received data on receiving the update action.', () => {
			const state = [];
			expect( shifts( state, updateAction ) ).toEqual( mockShifts );
		} );
	} );
} );
