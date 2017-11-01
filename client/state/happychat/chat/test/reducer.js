/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { lastActivityTimestamp } from '../reducer';
import {
	HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE,
	HAPPYCHAT_RECEIVE_EVENT,
	HAPPYCHAT_CONNECTED,
} from 'state/action-types';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lastActivityTimestamp', () => {
		Date.now = jest.fn();
		Date.now.mockReturnValue( NOW );

		test( 'defaults to null', () => {
			const result = lastActivityTimestamp( undefined, {} );
			expect( result ).to.be.null;
		} );

		test( 'should update on HAPPYCHAT_RECEIVE_EVENT', () => {
			const result = lastActivityTimestamp( null, { type: HAPPYCHAT_RECEIVE_EVENT } );
			expect( result ).to.equal( NOW );
		} );

		test( 'should update on HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE', () => {
			const result = lastActivityTimestamp( null, { type: HAPPYCHAT_IO_SEND_MESSAGE_MESSAGE } );
			expect( result ).to.equal( NOW );
		} );

		test( 'should not update on other actions', () => {
			const result = lastActivityTimestamp( null, { type: HAPPYCHAT_CONNECTED } );
			expect( result ).to.equal( null );
		} );
	} );
} );
