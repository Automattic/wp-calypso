/** @format */

/**
 * Internal dependencies
 */
import { availableTimes } from '../reducer';
import {
	CONCIERGE_AVAILABLE_TIMES_REQUEST,
	CONCIERGE_AVAILABLE_TIMES_UPDATE,
} from 'state/action-types';

describe( 'concierge/availableTimes/reducer', () => {
	const mockAvailableTimes = [
		new Date( '2017-01-01 08:00:00' ),
		new Date( '2017-01-01 09:00:00' ),
		new Date( '2017-01-01 10:00:00' ),
	];

	const requestAction = {
		type: CONCIERGE_AVAILABLE_TIMES_REQUEST,
	};

	const updateAction = {
		type: CONCIERGE_AVAILABLE_TIMES_UPDATE,
		availableTimes: mockAvailableTimes,
	};

	describe( 'availableTimes', () => {
		test( 'should be defaulted as null.', () => {
			expect( availableTimes( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the request action.', () => {
			const state = mockAvailableTimes;
			expect( availableTimes( state, requestAction ) ).toBeNull();
		} );

		test( 'should be the received data on receiving the update action.', () => {
			const state = [];
			expect( availableTimes( state, updateAction ) ).toEqual( mockAvailableTimes );
		} );
	} );
} );
