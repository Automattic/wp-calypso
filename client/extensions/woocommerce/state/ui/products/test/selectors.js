/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getProductEdits,
	getProductWithLocalEdits,
	getCurrentlyEditingProduct,
} from '../selectors';

describe( 'selectors', () => {
	let state;

	beforeEach( () => {
		state = {
			extensions: {
				woocommerce: {
					products: [
						// TODO: After the product API code is in, add more fields here.
						{ id: 1 },
					],
					ui: {
						products: {
						}
					},
				},
			},
		};
	} );

	describe( 'getProductEdits', () => {
		it( 'should get a product from "creates"', () => {
			const newProduct = { id: { index: 0 }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, 'edits.creates', [ newProduct ] );

			expect( getProductEdits( state, newProduct.id ) ).to.equal( newProduct );
		} );

		it( 'should get a product from "updates"', () => {
			const updateProduct = { id: 1, name: 'Existing Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, 'edits.updates', [ updateProduct ] );

			expect( getProductEdits( state, updateProduct.id ) ).to.equal( updateProduct );
		} );

		it( 'should return undefined if no edits are found for productId', () => {
			expect( getProductEdits( state, 1 ) ).to.not.exist;
			expect( getProductEdits( state, { index: 9 } ) ).to.not.exist;
		} );
	} );

	describe( 'getProductWithLocalEdits', () => {
		it( 'should get just edits for a product in "creates"', () => {
			const newProduct = { id: { index: 0 }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, 'edits.creates', [ newProduct ] );

			expect( getProductWithLocalEdits( state, newProduct.id ) ).to.eql( newProduct );
		} );

		it( 'should get just fetched data for a product that has no edits', () => {
			const products = state.extensions.woocommerce.products;

			expect( getProductWithLocalEdits( state, 1 ) ).to.eql( products[ 0 ] );
		} );

		it( 'should get both fetched data and edits for a product in "updates"', () => {
			const uiProducts = state.extensions.woocommerce.ui.products;
			const products = state.extensions.woocommerce.products;

			const existingProduct = { id: 1, name: 'Existing Product' };
			set( uiProducts, 'edits.updates', [ existingProduct ] );

			const combinedProduct = { ...products[ 0 ], ...existingProduct };
			expect( getProductWithLocalEdits( state, 1 ) ).to.eql( combinedProduct );
		} );

		it( 'should return undefined if no product is found for productId', () => {
			expect( getProductWithLocalEdits( state, 42 ) ).to.not.exist;
			expect( getProductWithLocalEdits( state, { index: 42 } ) ).to.not.exist;
		} );
	} );

	describe( 'getCurrentlyEditingProduct', () => {
		it( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingProduct( state ) ).to.not.exist;
		} );

		it( 'should get the last edited product', () => {
			const newProduct = { id: { index: 0 }, name: 'New Product' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, 'edits.creates', [ newProduct ] );
			set( uiProducts, 'edits.currentlyEditingId', newProduct.id );

			expect( getCurrentlyEditingProduct( state ) ).to.eql( newProduct );
		} );
	} );
} );
