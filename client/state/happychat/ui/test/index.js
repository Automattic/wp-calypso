/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SERIALIZE, DESERIALIZE, HAPPYCHAT_BLUR, HAPPYCHAT_FOCUS } from 'state/action-types';
import { lostFocusAt as lostFocusAtWithoutValidation } from '../reducer';
import { withSchemaValidation } from 'state/utils';
jest.mock( 'lib/warn', () => () => {} );

const lostFocusAt = withSchemaValidation(
	lostFocusAtWithoutValidation.schema,
	lostFocusAtWithoutValidation
);

// Simulate the time Feb 27, 2017 05:25 UTC
const NOW = 1488173100125;

describe( 'reducers', () => {
	describe( '#lostFocusAt', () => {
		Date.now = jest.fn();
		Date.now.mockReturnValue( NOW );

		test( 'defaults to null', () => {
			expect( lostFocusAt( undefined, {} ) ).to.be.null;
		} );

		test( 'SERIALIZEs to Date.now() if state is null', () => {
			expect( lostFocusAt( null, { type: SERIALIZE } ) ).to.eql( NOW );
		} );

		test( 'DESERIALIZEs a valid value', () => {
			expect( lostFocusAt( 1, { type: DESERIALIZE } ) ).eql( 1 );
		} );

		test( 'does not DESERIALIZEs invalid values', () => {
			expect( lostFocusAt( {}, { type: DESERIALIZE } ) ).eql( null );
			expect( lostFocusAt( '1', { type: DESERIALIZE } ) ).eql( null );
		} );

		test( 'returns Date.now() on HAPPYCHAT_BLUR actions', () => {
			expect( lostFocusAt( null, { type: HAPPYCHAT_BLUR } ) ).to.eql( NOW );
		} );

		test( 'returns null on HAPPYCHAT_FOCUS actions', () => {
			expect( lostFocusAt( 12345, { type: HAPPYCHAT_FOCUS } ) ).to.be.null;
		} );
	} );
} );
