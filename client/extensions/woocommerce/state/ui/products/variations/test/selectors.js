/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getVariationEdits,
	getVariationWithLocalEdits,
	getCurrentlyEditingVariation,
} from '../selectors';

describe( 'selectors', () => {
	let state;

	beforeEach( () => {
		state = {
			extensions: {
				woocommerce: {
					products: [
						// TODO: After the product API code is in, add more fields here.
						{ id: 2 },
					],
					variations: [
						// TODO: After the variation API code is in, add more fields here.
						{ id: 3 },
					],
					ui: {
						products: {
							variations: {
							}
						}
					},
				},
			},
		};
	} );

	describe( 'getVariationEdits', () => {
		it( 'should get a variation from "creates"', () => {
			const newVariation = { id: { index: 1 }, name: 'New Variation' };
			const productId = { index: 0 };
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', productId );
			set( uiVariations, 'edits[0].creates', [ newVariation ] );

			expect( getVariationEdits( state, productId, newVariation.id ) ).to.equal( newVariation );
		} );

		it( 'should get a variation from "updates"', () => {
			const updateVariation = { id: 3, name: 'Existing Variation' };
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 2 );
			set( uiVariations, 'edits[0].updates', [ updateVariation ] );

			expect( getVariationEdits( state, 2, updateVariation.id ) ).to.equal( updateVariation );
		} );

		it( 'should return undefined if no edits are found for productId', () => {
			expect( getVariationEdits( state, 2, 3 ) ).to.not.exist;
			expect( getVariationEdits( state, 2, { index: 9 } ) ).to.not.exist;
		} );

		it( 'should return undefined if no edits are found for variationId', () => {
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 2 );
			expect( getVariationEdits( state, 2, 3 ) ).to.not.exist;
			expect( getVariationEdits( state, 2, { index: 9 } ) ).to.not.exist;
		} );
	} );

	describe( 'getVariationWithLocalEdits', () => {
		it( 'should get just edits for a variation in "creates"', () => {
			const newVariation = { id: { index: 0 }, name: 'New Variation' };
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 2 );
			set( uiVariations, 'edits[0].creates', [ newVariation ] );

			expect( getVariationWithLocalEdits( state, 2, newVariation.id ) ).to.eql( newVariation );
		} );

		it( 'should get just fetched data for a variation that has no edits', () => {
			const variations = state.extensions.woocommerce.variations;

			expect( getVariationWithLocalEdits( state, 2, 3 ) ).to.eql( variations[ 0 ] );
		} );

		it( 'should get both fetched data and edits for a variation in "updates"', () => {
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			const variations = state.extensions.woocommerce.variations;

			const existingVariation = { id: 3, name: 'Existing Variation' };
			set( uiVariations, 'edits[0].productId', 2 );
			set( uiVariations, 'edits[0].updates', [ existingVariation ] );

			const combinedVariation = { ...variations[ 0 ], ...existingVariation };
			expect( getVariationWithLocalEdits( state, 2, 3 ) ).to.eql( combinedVariation );
		} );

		it( 'should return undefined if no variation is found for variationId', () => {
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 42 );
			expect( getVariationWithLocalEdits( state, 42, 43 ) ).to.not.exist;
			expect( getVariationWithLocalEdits( state, 42, { index: 55 } ) ).to.not.exist;
		} );

		it( 'should return undefined if no product is found for productId', () => {
			expect( getVariationWithLocalEdits( state, 42, 43 ) ).to.not.exist;
			expect( getVariationWithLocalEdits( state, 42, { index: 55 } ) ).to.not.exist;
		} );
	} );

	describe( 'getCurrentlyEditingVariation', () => {
		it( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingVariation( state, 2 ) ).to.not.exist;
		} );

		it( 'should get the last edited variation', () => {
			const newVariation = { id: { index: 0 }, name: 'New Variation' };
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 2 );
			set( uiVariations, 'edits[0].creates', [ newVariation ] );
			set( uiVariations, 'edits[0].currentlyEditingId', newVariation.id );

			expect( getCurrentlyEditingVariation( state, 2 ) ).to.eql( newVariation );
		} );
	} );
} );
