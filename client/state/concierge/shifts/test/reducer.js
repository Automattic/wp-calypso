/** @format */

/**
 * Internal dependencies
 */
import { items, isFetching } from '../reducer';
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

	describe( 'items', () => {
		test( 'should be defaulted as null.', () => {
			expect( items( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the fetch action.', () => {
			const state = mockShifts;
			expect( items( state, fetchAction ) ).toBeNull();
		} );

		test( 'should be the received data on receiving the update action.', () => {
			const state = [];
			expect( items( state, updateAction ) ).toEqual( mockShifts );
		} );
	} );

	describe( 'isFetching', () => {
		test( 'should be defaulted as false.', () => {
			expect( isFetching( undefined, {} ) ).toBe( false );
		} );

		test( 'should be true on receiving the fetch action.', () => {
			expect( isFetching( undefined, fetchAction ) ).toBe( true );
		} );

		test( 'should be false on receiving the update action.', () => {
			expect( isFetching( undefined, updateAction ) ).toBe( false );
		} );
	} );
} );
