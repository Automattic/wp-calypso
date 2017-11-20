/** @format */

/**
 * Internal dependencies
 */
import { shifts } from '../reducer';
import { CONCIERGE_SHIFTS_REQUEST, CONCIERGE_SHIFTS_UPDATE } from 'state/action-types';

describe( 'concierge/shifts/reducer', () => {
	const mockShifts = [ { description: 'shift1' }, { description: 'shift2' } ];

	const requestAction = {
		type: CONCIERGE_SHIFTS_REQUEST,
	};

	const updateAction = {
		type: CONCIERGE_SHIFTS_UPDATE,
		shifts: mockShifts,
	};

	describe( 'shifts', () => {
		test( 'should be defaulted as null.', () => {
			expect( shifts( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the request action.', () => {
			const state = mockShifts;
			expect( shifts( state, requestAction ) ).toBeNull();
		} );

		test( 'should be the received data on receiving the update action.', () => {
			const state = [];
			expect( shifts( state, updateAction ) ).toEqual( mockShifts );
		} );
	} );
} );
