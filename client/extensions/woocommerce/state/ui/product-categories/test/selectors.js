/**
 * External dependencies
 */
import { expect } from 'chai';
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getProductCategoryEdits,
	getProductCategoryWithLocalEdits,
	getCurrentlyEditingProductCategory,
} from '../selectors';
import { getProductCategory } from 'woocommerce/state/sites/product-categories/selectors';

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
							productCategories: [
								{ id: 1, name: 'cat 1', slug: 'cat-1' },
								{ id: 2, name: 'cat 2', slug: 'cat-2' },
								{ id: 3, name: 'cat 3', slug: 'cat-3' },
							],
						},
					},
					ui: {
						productCategories: {
							[ siteId ]: {
							}
						}
					},
				}
			}
		};
	} );

	describe( '#getProductCategoryEdits', () => {
		it( 'should get a category from "creates"', () => {
			const newCategory = { id: { index: 0 }, name: 'New Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'creates' ], [ newCategory ] );

			expect( getProductCategoryEdits( state, newCategory.id ) ).to.equal( newCategory );
		} );

		it( 'should get a category from "updates"', () => {
			const categoryUpdate = { id: 1, name: 'Existing Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'updates' ], [ categoryUpdate ] );

			expect( getProductCategoryEdits( state, categoryUpdate.id ) ).to.equal( categoryUpdate );
		} );

		it( 'should return undefined if no edits are found for category id', () => {
			expect( getProductCategoryEdits( state, 1 ) ).to.not.exist;
			expect( getProductCategoryEdits( state, { index: 9 } ) ).to.not.exist;
		} );
	} );

	describe( '#getProductCategoryWithLocalEdits', () => {
		it( 'should get just edits for a category in "creates"', () => {
			const newCategory = { id: { index: 0 }, name: 'New Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'creates' ], [ newCategory ] );

			expect( getProductCategoryWithLocalEdits( state, newCategory.id ) ).to.eql( newCategory );
		} );

		it( 'should get just fetched data for a category that has no edits', () => {
			const fetchedCategory2 = getProductCategory( state, 2 );
			expect( getProductCategoryWithLocalEdits( state, 2 ) ).to.eql( fetchedCategory2 );
		} );

		it( 'should get both fetched data and edits for a category in "updates"', () => {
			const fetchedCategory2 = getProductCategory( state, 2 );
			const categoryUpdate = { id: 2, name: 'Existing Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'updates' ], [ categoryUpdate ] );

			const combinedCategory = { ...fetchedCategory2, ...categoryUpdate };
			expect( getProductCategoryWithLocalEdits( state, 2 ) ).to.eql( combinedCategory );
		} );

		it( 'should return undefined if no category is found for category id', () => {
			expect( getProductCategoryWithLocalEdits( state, 42 ) ).to.not.exist;
			expect( getProductCategoryWithLocalEdits( state, { index: 42 } ) ).to.not.exist;
		} );
	} );

	describe( '#getCurrentlyEditingProductCategory', () => {
		it( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingProductCategory( state ) ).to.not.exist;
		} );

		it( 'should get the last edited category', () => {
			const newCategory = { id: { index: 0 }, name: 'New Category' };
			const uiProductCategories = state.extensions.woocommerce.ui.productCategories;
			set( uiProductCategories, [ siteId, 'edits', 'creates' ], [ newCategory ] );
			set( uiProductCategories, [ siteId, 'edits', 'currentlyEditingId' ], newCategory.id );

			expect( getCurrentlyEditingProductCategory( state ) ).to.eql( newCategory );
		} );
	} );
} );

