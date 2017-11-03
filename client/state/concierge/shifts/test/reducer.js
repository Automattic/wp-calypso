/** @format */

/**
 * Internal dependencies
 */
import { items, isRequesting, error } from '../reducer';
import {
	CONCIERGE_SHIFTS_FETCH,
	CONCIERGE_SHIFTS_FETCH_FAILED,
	CONCIERGE_SHIFTS_FETCH_SUCCESS,
} from 'state/action-types';

describe( 'concierge/shifts/reducer', () => {
	const mockShifts = [ { description: 'shift1' }, { description: 'shift2' } ];

	const fetchAction = {
		type: CONCIERGE_SHIFTS_FETCH,
	};

	const fetchSucceededAction = {
		type: CONCIERGE_SHIFTS_FETCH_SUCCESS,
		shifts: mockShifts,
	};

	const fetchFailedAction = {
		type: CONCIERGE_SHIFTS_FETCH_FAILED,
		error: {
			status: 400,
			message: 'something go wrong!',
		},
	};

	describe( 'items', () => {
		test( 'should be defaulted as null.', () => {
			expect( items( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the fetch action.', () => {
			const state = mockShifts;
			expect( items( state, fetchAction ) ).toBeNull();
		} );

		test( 'should be unchanged on receiving the failed action.', () => {
			const state = mockShifts;
			expect( items( state, fetchFailedAction ) ).toEqual( mockShifts );
		} );

		test( 'should be the received data on receiving the succeeded action.', () => {
			const state = [];
			expect( items( state, fetchSucceededAction ) ).toEqual( mockShifts );
		} );
	} );

	describe( 'isRequesting', () => {
		test( 'should be defaulted as false.', () => {
			expect( isRequesting( undefined, {} ) ).toBe( false );
		} );

		test( 'should be true on receiving the fetch action.', () => {
			expect( isRequesting( undefined, fetchAction ) ).toBe( true );
		} );

		test( 'should be false on receiving the failed action.', () => {
			expect( isRequesting( undefined, fetchFailedAction ) ).toBe( false );
		} );

		test( 'should be false on receiving the succeeded action.', () => {
			expect( isRequesting( undefined, fetchSucceededAction ) ).toBe( false );
		} );
	} );

	describe( 'error', () => {
		test( 'should be defauled as null.', () => {
			expect( error( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the fetch action.', () => {
			expect( error( undefined, fetchAction ) ).toBeNull();
		} );

		test( 'should be the error on receiving the failed action.', () => {
			expect( error( undefined, fetchFailedAction ) ).toEqual( fetchFailedAction.error );
		} );

		test( 'should be null on receiving the succeeded action.', () => {
			expect( error( undefined, fetchSucceededAction ) ).toBeNull();
		} );
	} );
} );
