/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { lostFocusAt } from '../reducer';
import { HAPPYCHAT_BLUR, HAPPYCHAT_FOCUS, SERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lostFocusAt', () => {
		useSandbox( sandbox => {
			sandbox.stub( Date, 'now' ).returns( NOW );
		} );

		it( 'defaults to null', () => {
			expect( lostFocusAt( undefined, {} ) ).to.be.null;
		} );

		it( 'SERIALIZEs to Date.now() if state is null', () => {
			expect( lostFocusAt( null, { type: SERIALIZE } ) ).to.eql( NOW );
		} );

		it( 'returns Date.now() on HAPPYCHAT_BLUR actions', () => {
			expect( lostFocusAt( null, { type: HAPPYCHAT_BLUR } ) ).to.eql( NOW );
		} );

		it( 'returns null on HAPPYCHAT_FOCUS actions', () => {
			expect( lostFocusAt( 12345, { type: HAPPYCHAT_FOCUS } ) ).to.be.null;
		} );
	} );
} );
