/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isFailed } from 'calypso/state/automated-transfer/selectors/is-automated-transfer-failed';
import { transferStates } from 'calypso/state/automated-transfer/constants';

describe( 'Automated Transfer', () => {
	describe( 'isFailed()', () => {
		test( 'should return `null` if no information is available', () => {
			expect( isFailed( null ) ).to.be.null;
			expect( isFailed( '' ) ).to.be.null; // plausible that the status could wind up as an empty string
		} );

		test( 'should return `true` for failed transfer states', () => {
			expect( isFailed( transferStates.CONFLICTS ) ).to.be.true;
			expect( isFailed( transferStates.FAILURE ) ).to.be.true;
		} );

		test( 'should return `false` for non-failed transfer states', () => {
			expect( isFailed( transferStates.COMPLETE ) ).to.be.false;
			expect( isFailed( transferStates.INQUIRING ) ).to.be.false;
			expect( isFailed( transferStates.START ) ).to.be.false;
		} );
	} );
} );
