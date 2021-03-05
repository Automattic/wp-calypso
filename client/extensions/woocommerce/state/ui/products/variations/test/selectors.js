/**
 * External dependencies
 */
import { expect } from 'chai';
import { find, set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getVariationEdits,
	getVariationWithLocalEdits,
	getCurrentlyEditingVariation,
	getProductVariationsWithLocalEdits,
} from '../selectors';
import productVariations from 'woocommerce/state/sites/product-variations/test/fixtures/variations';
import products from 'woocommerce/state/sites/products/test/fixtures/products';

const siteId = 123;

describe( 'selectors', () => {
	let state;

	beforeEach( () => {
		state = {
			ui: { selectedSiteId: 123 },
			extensions: {
				woocommerce: {
					sites: {
						123: {
							products: {
								products,
							},
							productVariations,
						},
					},
					ui: {
						products: {
							123: {
								variations: {},
							},
						},
					},
				},
			},
		};
	} );

	describe( 'getVariationEdits', () => {
		test( 'should get a variation from "creates"', () => {
			const newVariation = { id: { placeholder: 'product_variation_1' }, sku: 'new-variation' };
			const productId = { placeholder: 'product_0' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], productId );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'creates' ], [ newVariation ] );

			expect( getVariationEdits( state, productId, newVariation.id ) ).to.equal( newVariation );
		} );

		test( 'should get a variation from "updates"', () => {
			const updateVariation = { id: 733, sku: 'updated-variation' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'updates' ], [ updateVariation ] );

			expect( getVariationEdits( state, 15, updateVariation.id ) ).to.equal( updateVariation );
		} );

		test( 'should return undefined if no edits are found for productId', () => {
			expect( getVariationEdits( state, 15, 102919 ) ).to.not.exist;
			expect( getVariationEdits( state, 15, { placeholder: 'product_variation_9' } ) ).to.not.exist;
		} );

		test( 'should return undefined if no edits are found for variationId', () => {
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 15 );
			expect( getVariationEdits( state, 15, 102919 ) ).to.not.exist;
			expect( getVariationEdits( state, 15, { placeholder: 'product_variation_9' } ) ).to.not.exist;
		} );
	} );

	describe( 'getVariationWithLocalEdits', () => {
		test( 'should get just edits for a variation in "creates"', () => {
			const newVariation = { id: { placeholder: 'product_variation_0' }, sku: 'new-variation' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 2 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'creates' ], [ newVariation ] );

			expect( getVariationWithLocalEdits( state, 2, newVariation.id ) ).to.eql( newVariation );
		} );

		test( 'should get just fetched data for a variation that has no edits', () => {
			const allVariations = state.extensions.woocommerce.sites[ 123 ].productVariations;

			expect( getVariationWithLocalEdits( state, 15, 733 ) ).to.eql( allVariations[ 0 ] );
		} );

		test( 'should get both fetched data and edits for a variation in "updates"', () => {
			const uiProducts = state.extensions.woocommerce.ui.products;
			const allVariations = state.extensions.woocommerce.sites[ 123 ].productVariations;

			const existingVariation = { id: 733, sku: 'updated-variation' };
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'updates' ], [ existingVariation ] );

			const combinedVariation = { ...allVariations[ 0 ], ...existingVariation };
			expect( getVariationWithLocalEdits( state, 15, 733 ) ).to.eql( combinedVariation );
		} );

		test( 'should return undefined if no variation is found for variationId', () => {
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 42 );
			expect( getVariationWithLocalEdits( state, 42, 201202 ) ).to.not.exist;
			expect( getVariationWithLocalEdits( state, 42, { placeholder: 'product_variation_55' } ) ).to
				.not.exist;
		} );

		test( 'should return undefined if no product is found for productId', () => {
			expect( getVariationWithLocalEdits( state, 42, 102382 ) ).to.not.exist;
			expect( getVariationWithLocalEdits( state, 42, { placeholder: 'product_variation_55' } ) ).to
				.not.exist;
		} );
	} );

	describe( 'getCurrentlyEditingVariation', () => {
		test( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingVariation( state, 2 ) ).to.not.exist;
		} );

		test( 'should get the last edited variation', () => {
			const newVariation = { id: { placeholder: 'product_variation_0' }, sku: 'new-variation' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'creates' ], [ newVariation ] );
			set(
				uiProducts,
				[ siteId, 'variations', 'edits', '0', 'currentlyEditingId' ],
				newVariation.id
			);

			expect( getCurrentlyEditingVariation( state, 15 ) ).to.eql( newVariation );
		} );
	} );

	describe( 'getProductVariationsWithLocalEdits', () => {
		test( 'should return undefined if no product is found for productId', () => {
			expect( getProductVariationsWithLocalEdits( state, 4, 123 ) ).to.not.exist;
		} );

		test( 'should get variations from "creates"', () => {
			const newVariation = { id: { placeholder: 'product_variation_0' }, sku: 'new-variation' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'creates' ], [ newVariation ] );

			const variations = getProductVariationsWithLocalEdits( state, 15, 123 );
			expect( variations ).to.exist;
			expect( variations[ 0 ] ).to.exist;
			expect( variations[ 0 ].id ).to.equal( newVariation.id );
			expect( variations[ 0 ].sku ).to.equal( newVariation.sku );
		} );

		test( 'should get API data by itself for a variation with no edits', () => {
			const allVariations = state.extensions.woocommerce.sites[ 123 ].productVariations;

			const variations = getProductVariationsWithLocalEdits( state, 15, 123 );
			expect( variations ).to.exist;
			expect( variations ).to.eql( allVariations[ 15 ] );
		} );

		test( 'should get both fetched data and edits for a variation in "updates"', () => {
			const uiProducts = state.extensions.woocommerce.ui.products;

			const existingVariation = { id: 733, sku: 'updated-variation' };
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'updates' ], [ existingVariation ] );

			const variations = getProductVariationsWithLocalEdits( state, 15, 123 );
			expect( variations ).to.exist;
			expect( variations[ 0 ].id ).to.equal( existingVariation.id );
			expect( variations[ 0 ].sku ).to.equal( existingVariation.sku );
			expect( variations[ 0 ].price ).to.equal( '9.00' );
		} );

		test( 'should omit variations that have been deleted in the edits', () => {
			const variationsBefore = getProductVariationsWithLocalEdits( state, 15, 123 );
			expect( variationsBefore ).to.exist;
			expect( find( variationsBefore, { id: 733 } ) ).to.exist;

			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'deletes' ], [ 733 ] );

			const variationsAfter = getProductVariationsWithLocalEdits( state, 15, 123 );
			expect( variationsAfter ).to.exist;
			expect( find( variationsAfter, { id: 733 } ) ).to.not.exist;
		} );
	} );
} );
