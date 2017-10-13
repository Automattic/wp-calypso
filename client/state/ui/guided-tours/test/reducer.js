/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { guidedTour } from '../reducer';

describe( 'reducer', () => {
	describe( '#guidedTour()', () => {
		test( 'should default to an empty object', () => {
			const state = guidedTour( undefined, {} );

			expect( state ).to.be.empty;
		} );
	} );
} );
