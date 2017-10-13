/** @format */

/**
 * Internal dependencies
 */
import { lastActivityTimestamp } from '../reducer';
import {
	HAPPYCHAT_IO_RECEIVE_INIT,
	HAPPYCHAT_IO_RECEIVE_MESSAGE,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
} from 'state/action-types';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lastActivityTimestamp', () => {
		Date.now = jest.fn();
		Date.now.mockReturnValue( NOW );

		test( 'defaults to null', () => {
			const result = lastActivityTimestamp( undefined, {} );
			expect( result ).toBeNull();
		} );

		test( 'should update on certain activity-specific actions', () => {
			let result;

			result = lastActivityTimestamp( null, { type: HAPPYCHAT_IO_RECEIVE_MESSAGE } );
			expect( result ).toBe( NOW );

			result = lastActivityTimestamp( null, { type: HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE } );
			expect( result ).toBe( NOW );
		} );

		test( 'should not update on other actions', () => {
			const result = lastActivityTimestamp( null, { type: HAPPYCHAT_IO_RECEIVE_INIT } );
			expect( result ).toBeNull();
		} );
	} );
} );
