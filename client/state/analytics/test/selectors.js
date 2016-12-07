/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { hasAlreadyBeenRecorded } from '../selectors';

describe( 'selectors', () => {
	describe( 'hasAlreadyBeenRecorded()', () => {
		it( 'should return false if event not found in state', () => {
			const state = {
				analytics: {
					chicken: true
				}
			};

			expect( hasAlreadyBeenRecorded( state, 'ribs' ) ).to.be.false;
		} );

		it( 'should return true if event found in state', () => {
			const state = {
				analytics: {
					chicken: true
				}
			};

			expect( hasAlreadyBeenRecorded( state, 'chicken' ) ).to.be.true;
		} );
	} );
} );
