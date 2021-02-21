/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isActive } from 'calypso/state/automated-transfer/selectors/is-automated-transfer-active';
import { transferStates } from 'calypso/state/automated-transfer/constants';

describe( 'Automated Transfer', () => {
	describe( 'isActive()', () => {
		test( 'should return `null` if no information is available', () => {
			expect( isActive( null ) ).to.be.null;
			expect( isActive( '' ) ).to.be.null; // plausible that the status could wind up as an empty string
		} );

		test( 'should return `true` for active transfer states', () => {
			expect( isActive( transferStates.START ) ).to.be.true;
		} );

		test( 'should return `false` for non-active transfer states', () => {
			expect( isActive( transferStates.COMPLETE ) ).to.be.false;
			expect( isActive( transferStates.CONFLICTS ) ).to.be.false;
			expect( isActive( transferStates.FAILURE ) ).to.be.false;
			expect( isActive( transferStates.INQUIRING ) ).to.be.false;
		} );
	} );
} );
