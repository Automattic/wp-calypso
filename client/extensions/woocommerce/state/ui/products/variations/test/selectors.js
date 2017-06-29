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
	getProductVariationsWithLocalEdits,
} from '../selectors';
import products from 'woocommerce/state/sites/products/test/fixtures/products';
import variations from 'woocommerce/state/sites/product-variations/test/fixtures/variations';

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
								variations,
							},
						}
					},
					ui: {
						products: {
							123: {
								variations: {
								}
							}
						}
					},
				},
			},
		};
	} );

	describe( 'getVariationEdits', () => {
		it( 'should get a variation from "creates"', () => {
			const newVariation = { id: { index: 1 }, sku: 'new-variation' };
			const productId = { index: 0 };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], productId );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'creates' ], [ newVariation ] );

			expect( getVariationEdits( state, productId, newVariation.id ) ).to.equal( newVariation );
		} );

		it( 'should get a variation from "updates"', () => {
			const updateVariation = { id: 733, sku: 'updated-variation' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'updates' ], [ updateVariation ] );

			expect( getVariationEdits( state, 15, updateVariation.id ) ).to.equal( updateVariation );
		} );

		it( 'should return undefined if no edits are found for productId', () => {
			expect( getVariationEdits( state, 15, 102919 ) ).to.not.exist;
			expect( getVariationEdits( state, 15, { index: 9 } ) ).to.not.exist;
		} );

		it( 'should return undefined if no edits are found for variationId', () => {
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 15 );
			expect( getVariationEdits( state, 15, 102919 ) ).to.not.exist;
			expect( getVariationEdits( state, 15, { index: 9 } ) ).to.not.exist;
		} );
	} );

	describe( 'getVariationWithLocalEdits', () => {
		it( 'should get just edits for a variation in "creates"', () => {
			const newVariation = { id: { index: 0 }, sku: 'new-variation' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 2 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'creates' ], [ newVariation ] );

			expect( getVariationWithLocalEdits( state, 2, newVariation.id ) ).to.eql( newVariation );
		} );

		it( 'should get just fetched data for a variation that has no edits', () => {
			const allVariations = state.extensions.woocommerce.sites[ 123 ].products.variations;

			expect( getVariationWithLocalEdits( state, 15, 733 ) ).to.eql( allVariations[ 0 ] );
		} );

		it( 'should get both fetched data and edits for a variation in "updates"', () => {
			const uiProducts = state.extensions.woocommerce.ui.products;
			const allVariations = state.extensions.woocommerce.sites[ 123 ].products.variations;

			const existingVariation = { id: 733, sku: 'updated-variation' };
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'updates' ], [ existingVariation ] );

			const combinedVariation = { ...allVariations[ 0 ], ...existingVariation };
			expect( getVariationWithLocalEdits( state, 15, 733 ) ).to.eql( combinedVariation );
		} );

		it( 'should return undefined if no variation is found for variationId', () => {
			const uiVariations = state.extensions.woocommerce.ui.products.variations;
			set( uiVariations, 'edits[0].productId', 42 );
			expect( getVariationWithLocalEdits( state, 42, 201202 ) ).to.not.exist;
			expect( getVariationWithLocalEdits( state, 42, { index: 55 } ) ).to.not.exist;
		} );

		it( 'should return undefined if no product is found for productId', () => {
			expect( getVariationWithLocalEdits( state, 42, 102382 ) ).to.not.exist;
			expect( getVariationWithLocalEdits( state, 42, { index: 55 } ) ).to.not.exist;
		} );
	} );

	describe( 'getCurrentlyEditingVariation', () => {
		it( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingVariation( state, 2 ) ).to.not.exist;
		} );

		it( 'should get the last edited variation', () => {
			const newVariation = { id: { index: 0 }, sku: 'new-variation' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'creates' ], [ newVariation ] );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'currentlyEditingId' ], newVariation.id );

			expect( getCurrentlyEditingVariation( state, 15 ) ).to.eql( newVariation );
		} );
	} );

	describe( 'getProductVariationsWithLocalEdits', () => {
		it( 'should return undefined if no product is found for productId', () => {
			expect( getProductVariationsWithLocalEdits( state, 4, 123 ) ).to.not.exist;
		} );

		it( 'should get variations from "creates"', () => {
			const newVariation = { id: { index: 0 }, sku: 'new-variation' };
			const uiProducts = state.extensions.woocommerce.ui.products;
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'creates' ], [ newVariation ] );

			const productVariations = getProductVariationsWithLocalEdits( state, 15, 123 );
			expect( productVariations ).to.exist;
			expect( productVariations[ 0 ] ).to.exist;
			expect( productVariations[ 0 ].id ).to.equal( newVariation.id );
			expect( productVariations[ 0 ].sku ).to.equal( newVariation.sku );
		} );

		it( 'should get API data by itself for a variation with no edits', () => {
			const allVariations = state.extensions.woocommerce.sites[ 123 ].products.variations;

			const productVariations = getProductVariationsWithLocalEdits( state, 15, 123 );
			expect( productVariations ).to.exist;
			expect( productVariations ).to.eql( allVariations[ 15 ] );
		} );

		it( 'should get both fetched data and edits for a variation in "updates"', () => {
			const uiProducts = state.extensions.woocommerce.ui.products;

			const existingVariation = { id: 733, sku: 'updated-variation' };
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'productId' ], 15 );
			set( uiProducts, [ siteId, 'variations', 'edits', '0', 'updates' ], [ existingVariation ] );

			const productVariations = getProductVariationsWithLocalEdits( state, 15, 123 );
			expect( productVariations ).to.exist;
			expect( productVariations[ 0 ].id ).to.equal( existingVariation.id );
			expect( productVariations[ 0 ].sku ).to.equal( existingVariation.sku );
			expect( productVariations[ 0 ].price ).to.equal( '9.00' );
		} );
	} );
} );
