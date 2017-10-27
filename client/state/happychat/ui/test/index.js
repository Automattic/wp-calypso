/** @format */

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	HAPPYCHAT_SET_CURRENT_MESSAGE,
} from 'state/action-types';
import { lostFocusAt, currentMessage } from '../reducer';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lostFocusAt', () => {
		Date.now = jest.fn();
		Date.now.mockReturnValue( NOW );

		test( 'defaults to null', () => {
			expect( lostFocusAt( undefined, {} ) ).toBeNull();
		} );

		test( 'SERIALIZEs to Date.now() if state is null', () => {
			expect( lostFocusAt( null, { type: SERIALIZE } ) ).toBe( NOW );
		} );

		test( 'returns Date.now() on HAPPYCHAT_BLUR actions', () => {
			expect( lostFocusAt( null, { type: HAPPYCHAT_BLUR } ) ).toBe( NOW );
		} );

		test( 'returns null on HAPPYCHAT_FOCUS actions', () => {
			expect( lostFocusAt( 12345, { type: HAPPYCHAT_FOCUS } ) ).toBeNull();
		} );
	} );

	describe( '#message()', () => {
		test( 'defaults to an empty string', () => {
			const result = currentMessage( undefined, {} );
			expect( result ).toBe( '' );
		} );

		test( 'saves messages passed from HAPPYCHAT_SET_CURRENT_MESSAGE', () => {
			const action = { type: HAPPYCHAT_SET_CURRENT_MESSAGE, message: 'abcd' };
			const result = currentMessage( undefined, action );
			expect( result ).toBe( 'abcd' );
		} );

		test( 'resets to empty string on HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE', () => {
			const action = { type: HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE, message: 'abcd' };
			const result = currentMessage( 'abcd', action );
			expect( result ).toBe( '' );
		} );
	} );
} );
