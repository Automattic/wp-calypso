/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { transferStates } from 'state/automated-transfer/constants';

import { isActive } from '../is-automated-transfer-active';

describe( 'Automated Transfer', () => {
	describe( 'isActive()', () => {
		it( 'should return `null` if no information is available', () => {
			expect( isActive( null ) ).to.be.null;
			expect( isActive( '' ) ).to.be.null; // plausible that the status could wind up as an empty string
		} );

		it( 'should return `true` for active transfer states', () => {
			expect( isActive( transferStates.START ) ).to.be.true;
		} );

		it( 'should return `false` for non-active transfer states', () => {
			expect( isActive( transferStates.COMPLETE ) ).to.be.false;
			expect( isActive( transferStates.CONFLICTS ) ).to.be.false;
			expect( isActive( transferStates.INQUIRING ) ).to.be.false;
		} );
	} );
} );
