/** @format */

/**
 * Internal dependencies
 */
import { currentMessage } from '../reducer';
import {
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	HAPPYCHAT_SET_CURRENT_MESSAGE,
} from 'state/action-types';

describe( 'reducers', () => {
	describe( '#message()', () => {
		test( 'defaults to an empty string', () => {
			const result = currentMessage( undefined, {} );
			expect( result ).toBe( '' );
		} );

		test( 'saves messages passed from HAPPYCHAT_SET_CURRENT_MESSAGE', () => {
			const action = { type: HAPPYCHAT_SET_CURRENT_MESSAGE, message: 'abcd' };
			const result = currentMessage( 'abc', action );
			expect( result ).toBe( 'abcd' );
		} );

		test( 'resets to empty string on HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE', () => {
			const action = { type: HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE, message: 'abcd' };
			const result = currentMessage( 'abcd', action );
			expect( result ).toBe( '' );
		} );
	} );
} );
