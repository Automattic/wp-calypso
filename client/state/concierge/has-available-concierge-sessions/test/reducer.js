/**
 * Internal dependencies
 */
import { hasAvailableConciergeSessions } from '../reducer';
import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'state/action-types';

describe( 'concierge/scheduleId/reducer', () => {
	test( 'should default to null.', () => {
		expect( hasAvailableConciergeSessions( undefined, {} ) ).toBeNull();
	} );

	test( 'should be null on receiving the request action.', () => {
		expect(
			hasAvailableConciergeSessions( false, {
				type: CONCIERGE_INITIAL_REQUEST,
			} )
		).toBeNull();
	} );

	test( 'should be the received data on receiving the update action.', () => {
		const expectedHasAvailableSessions = true;

		const action = {
			type: CONCIERGE_INITIAL_UPDATE,
			initial: {
				hasAvailableConciergeSessions: expectedHasAvailableSessions,
			},
		};

		expect( hasAvailableConciergeSessions( undefined, action ) ).toEqual(
			expectedHasAvailableSessions
		);
	} );
} );
