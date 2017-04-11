/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	initialState,
	editProduct,
	edits,
} from '../reducer';

describe( 'reducer', () => {
	it( 'state should default to initialState', () => {
		const state = edits( undefined, {} );
		expect( state ).to.equal( initialState );
	} );

	describe( '#editProduct()', () => {
		it( 'should add field to edits list for new product', () => {
			const action = {
				payload: {
					id: null,
					key: 'title',
					value: 'Test Product',
				}
			};
			const stateOut = editProduct( initialState, action );
			expect( stateOut.add.title ).to.equal( 'Test Product' );
		} );
	} );
} );
