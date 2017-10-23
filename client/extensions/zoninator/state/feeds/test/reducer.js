/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items' ] );
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
