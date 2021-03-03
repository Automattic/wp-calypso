/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	HAPPYCHAT_BLUR,
	HAPPYCHAT_FOCUS,
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	HAPPYCHAT_SET_CURRENT_MESSAGE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { lostFocusAt, currentMessage } from '../reducer';
jest.mock( '@wordpress/warning', () => () => {} );

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lostFocusAt', () => {
		Date.now = jest.fn();
		Date.now.mockReturnValue( NOW );

		test( 'defaults to null', () => {
			expect( lostFocusAt( undefined, {} ) ).to.be.null;
		} );

		test( 'serializes to Date.now() if state is null', () => {
			expect( serialize( lostFocusAt, null ) ).to.eql( NOW );
		} );

		test( 'deserializes a valid value', () => {
			expect( deserialize( lostFocusAt, 1 ) ).eql( 1 );
		} );

		test( 'does not deserializes invalid values', () => {
			expect( deserialize( lostFocusAt, {} ) ).eql( null );
			expect( deserialize( lostFocusAt, '1' ) ).eql( null );
		} );

		test( 'returns Date.now() on HAPPYCHAT_BLUR actions', () => {
			expect( lostFocusAt( null, { type: HAPPYCHAT_BLUR } ) ).to.eql( NOW );
		} );

		test( 'returns null on HAPPYCHAT_FOCUS actions', () => {
			expect( lostFocusAt( 12345, { type: HAPPYCHAT_FOCUS } ) ).to.be.null;
		} );
	} );

	describe( '#message()', () => {
		test( 'defaults to an empty string', () => {
			const result = currentMessage( undefined, {} );
			expect( result ).to.eql( '' );
		} );

		test( 'saves messages passed from HAPPYCHAT_SET_CURRENT_MESSAGE', () => {
			const action = { type: HAPPYCHAT_SET_CURRENT_MESSAGE, message: 'abcd' };
			const result = currentMessage( undefined, action );
			expect( result ).to.eql( 'abcd' );
		} );

		test( 'resets to empty string on HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE', () => {
			const action = { type: HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE, payload: { message: 'abcd' } };
			const result = currentMessage( 'abcd', action );
			expect( result ).to.eql( '' );
		} );
	} );
} );
