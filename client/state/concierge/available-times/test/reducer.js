/**
 * Internal dependencies
 */
import { availableTimes } from '../reducer';
import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'calypso/state/action-types';

describe( 'concierge/availableTimes/reducer', () => {
	const mockInitial = {
		availableTimes: [
			new Date( '2017-01-01 08:00:00' ),
			new Date( '2017-01-01 09:00:00' ),
			new Date( '2017-01-01 10:00:00' ),
		],
	};

	const requestAction = {
		type: CONCIERGE_INITIAL_REQUEST,
	};

	const updateAction = {
		type: CONCIERGE_INITIAL_UPDATE,
		initial: mockInitial,
	};

	describe( 'availableTimes', () => {
		test( 'should be defaulted as null.', () => {
			expect( availableTimes( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the request action.', () => {
			const state = mockInitial;
			expect( availableTimes( state, requestAction ) ).toBeNull();
		} );

		test( 'should be the received data on receiving the update action.', () => {
			const state = [];
			expect( availableTimes( state, updateAction ) ).toEqual( mockInitial.availableTimes );
		} );
	} );
} );
