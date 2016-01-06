/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { POST_RECEIVE } from 'state/action-types';
import { items } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index posts by ID', () => {
			const state = items( null, {
				type: POST_RECEIVE,
				post: { ID: 841, title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Hello World' }
			} );
		} );

		it( 'should accumulate posts', () => {
			const original = Object.freeze( {
				841: { ID: 841, title: 'Hello World' }
			} );
			const state = items( original, {
				type: POST_RECEIVE,
				post: { ID: 413, title: 'Ribs & Chicken' }
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Hello World' },
				413: { ID: 413, title: 'Ribs & Chicken' }
			} );
		} );

		it( 'should override previous post of same ID', () => {
			const original = Object.freeze( {
				841: { ID: 841, title: 'Hello World' }
			} );
			const state = items( original, {
				type: POST_RECEIVE,
				post: { ID: 841, title: 'Ribs & Chicken' }
			} );

			expect( state ).to.eql( {
				841: { ID: 841, title: 'Ribs & Chicken' }
			} );
		} );
	} );
} );
