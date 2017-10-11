/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { lastActivityTimestamp, message } from '../reducer';
import {
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_SEND_MESSAGE,
	HAPPYCHAT_SET_MESSAGE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lastActivityTimestamp', () => {
		useSandbox( sandbox => {
			sandbox.stub( Date, 'now' ).returns( NOW );
		} );

		test( 'defaults to null', () => {
			const result = lastActivityTimestamp( undefined, {} );
			expect( result ).to.be.null;
		} );

		test( 'should update on certain activity-specific actions', () => {
			let result;

			result = lastActivityTimestamp( null, { type: HAPPYCHAT_RECEIVE_EVENT } );
			expect( result ).to.equal( NOW );

			result = lastActivityTimestamp( null, { type: HAPPYCHAT_SEND_MESSAGE } );
			expect( result ).to.equal( NOW );
		} );
	} );

	describe( '#message()', () => {
		test( 'defaults to an empty string', () => {
			const result = message( undefined, {} );
			expect( result ).to.eql( '' );
		} );
		test( 'saves messages passed from HAPPYCHAT_SET_MESSAGE', () => {
			const action = { type: HAPPYCHAT_SET_MESSAGE, message: 'abcd' };
			const result = message( 'abc', action );
			expect( result ).to.eql( 'abcd' );
		} );
		test( 'resets to empty string on HAPPYCHAT_SEND_MESSAGE', () => {
			const action = { type: HAPPYCHAT_SEND_MESSAGE, message: 'abcd' };
			const result = message( 'abcd', action );
			expect( result ).to.eql( '' );
		} );
	} );
} );
