/** @format */

/**
 * Internal dependencies
 */
import { slots } from '../reducer';
import { CONCIERGE_SLOTS_REQUEST, CONCIERGE_SLOTS_UPDATE } from 'state/action-types';

describe( 'concierge/slots/reducer', () => {
	const mockSlots = [ { description: 'shift1' }, { description: 'shift2' } ];

	const requestAction = {
		type: CONCIERGE_SLOTS_REQUEST,
	};

	const updateAction = {
		type: CONCIERGE_SLOTS_UPDATE,
		slots: mockSlots,
	};

	describe( 'slots', () => {
		test( 'should be defaulted as null.', () => {
			expect( slots( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the request action.', () => {
			const state = mockSlots;
			expect( slots( state, requestAction ) ).toBeNull();
		} );

		test( 'should be the received data on receiving the update action.', () => {
			const state = [];
			expect( slots( state, updateAction ) ).toEqual( mockSlots );
		} );
	} );
} );
