/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { set, find } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getProductCategoryEdits,
	getProductCategoryWithLocalEdits,
	getProductCategoriesWithLocalEdits,
	getCurrentlyEditingProductCategory,
} from '../selectors';
import {
	getProductCategory,
	getProductCategories,
} from 'woocommerce/state/sites/product-categories/selectors';

const siteId = 123;

describe( 'selectors', () => {
	let state;

	beforeEach( () => {
		state = {
			ui: { selectedSiteId: siteId },
			extensions: {
				woocommerce: {
					sites: {
						[ siteId ]: {
							productCategories: {
								items: {
									1: { id: 1, name: 'cat 1', slug: 'cat-1' },
									2: { id: 2, name: 'cat 2', slug: 'cat-2' },
									3: { id: 3, name: 'cat 3', slug: 'cat-3' },
								},
								queries: {
									'{}': [ 1, 2, 3 ],
								},
							},
						},
					},
					ui: {
						productCategories: {
							[ siteId ]: {},
						},
					},
				},
			},
		};
	} );

	describe( '#getProductCategoryEdits', () => {
		test( 'should get a category from "creates"', () => {
			const newCategory = { id: { index: 0 }, name: 'New Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'creates' ], [ newCategory ] );

			expect( getProductCategoryEdits( state, newCategory.id ) ).to.equal( newCategory );
		} );

		test( 'should get a category from "updates"', () => {
			const categoryUpdate = { id: 1, name: 'Existing Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'updates' ], [ categoryUpdate ] );

			expect( getProductCategoryEdits( state, categoryUpdate.id ) ).to.equal( categoryUpdate );
		} );

		test( 'should return undefined if no edits are found for category id', () => {
			expect( getProductCategoryEdits( state, 1 ) ).to.not.exist;
			expect( getProductCategoryEdits( state, { index: 9 } ) ).to.not.exist;
		} );
	} );

	describe( '#getProductCategoryWithLocalEdits', () => {
		test( 'should get just edits for a category in "creates"', () => {
			const newCategory = { id: { index: 0 }, name: 'New Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'creates' ], [ newCategory ] );

			expect( getProductCategoryWithLocalEdits( state, newCategory.id ) ).to.eql( newCategory );
		} );

		test( 'should get just fetched data for a category that has no edits', () => {
			const fetchedCategory2 = getProductCategory( state, 2 );
			expect( getProductCategoryWithLocalEdits( state, 2 ) ).to.eql( fetchedCategory2 );
		} );

		test( 'should get both fetched data and edits for a category in "updates"', () => {
			const fetchedCategory2 = getProductCategory( state, 2 );
			const categoryUpdate = { id: 2, name: 'Existing Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'updates' ], [ categoryUpdate ] );

			const combinedCategory = { ...fetchedCategory2, ...categoryUpdate };
			expect( getProductCategoryWithLocalEdits( state, 2 ) ).to.eql( combinedCategory );
		} );

		test( 'should return undefined if no category is found for category id', () => {
			expect( getProductCategoryWithLocalEdits( state, 42 ) ).to.not.exist;
			expect( getProductCategoryWithLocalEdits( state, { index: 42 } ) ).to.not.exist;
		} );
	} );

	describe( '#getProductCategoriesWithLocalEdits', () => {
		test( 'should match fetched data when there have been no edits', () => {
			const fetchedCategories = getProductCategories( state );
			expect( getProductCategoriesWithLocalEdits( state ) ).to.eql( fetchedCategories );
		} );

		test( 'should contain categories in "creates"', () => {
			const newCategory1 = { id: { index: 0 }, name: 'New Category 1' };
			const newCategory2 = { id: { index: 1 }, name: 'New Category 2' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'creates' ], [ newCategory1, newCategory2 ] );

			const combinedCategories = getProductCategoriesWithLocalEdits( state );
			expect( find( combinedCategories, c => newCategory1.id === c.id ) ).to.equal( newCategory1 );
			expect( find( combinedCategories, c => newCategory2.id === c.id ) ).to.equal( newCategory2 );
		} );

		test( 'should contain combined categories from fetched data with "updates" overlaid', () => {
			const fetchedCategory1 = getProductCategory( state, 1 );
			const fetchedCategory2 = getProductCategory( state, 2 );
			const categoryUpdate1 = { id: 1, name: 'Updated Category 1' };
			const categoryUpdate2 = { id: 2, name: 'Updated Category 2' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set(
				uiProductCategories,
				[ siteId, 'edits', 'updates' ],
				[ categoryUpdate1, categoryUpdate2 ]
			);

			const combinedCategories = getProductCategoriesWithLocalEdits( state );
			const combinedCategory1 = find( combinedCategories, c => categoryUpdate1.id === c.id );
			const combinedCategory2 = find( combinedCategories, c => categoryUpdate2.id === c.id );
			expect( combinedCategory1 ).to.eql( { ...fetchedCategory1, ...categoryUpdate1 } );
			expect( combinedCategory2 ).to.eql( { ...fetchedCategory2, ...categoryUpdate2 } );
		} );
	} );

	describe( '#getCurrentlyEditingProductCategory', () => {
		test( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingProductCategory( state ) ).to.not.exist;
		} );

		test( 'should get the last edited category', () => {
			const newCategory = { id: { index: 0 }, name: 'New Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'creates' ], [ newCategory ] );
			set( uiProductCategories, [ siteId, 'edits', 'currentlyEditingId' ], newCategory.id );

			expect( getCurrentlyEditingProductCategory( state ) ).to.eql( newCategory );
		} );
	} );
} );
