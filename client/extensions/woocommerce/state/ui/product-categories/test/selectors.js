/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getProductCategoryEdits,
	getProductCategoryWithLocalEdits,
	getProductCategoriesWithLocalEdits,
	getCurrentlyEditingProductCategory,
	getCurrentlyEditingId,
} from '../selectors';
import wooState from './fixtures/state';
const state = deepFreeze( wooState );

/*
 * state.extensions.woocommerce.sites has four sites:
 *  - site.one: Has one update to ID 2
 *  - site.two: Has a new category to be created
 *  - site.three: no local edits
 */

describe( 'selectors', () => {
	describe( '#getProductCategoryEdits', () => {
		test( 'should get a category from "creates"', () => {
			const cat = {
				id: { placeholder: 'productCategory_1' },
				label: 'test1',
				name: 'test1',
			};
			expect( getProductCategoryEdits( state, cat.id, 'site.two' ) ).to.eql( cat );
		} );

		test( 'should get a category from "updates"', () => {
			const cat = {
				id: 2,
				name: 'new name',
			};
			expect( getProductCategoryEdits( state, cat.id, 'site.one' ) ).to.eql( cat );
		} );

		test( 'should return undefined if no edits are found for category id', () => {
			expect( getProductCategoryEdits( state, 1 ) ).to.not.exist;
			expect( getProductCategoryEdits( state, { index: 9 } ) ).to.not.exist;
		} );
	} );

	describe( '#getProductCategoryWithLocalEdits', () => {
		test( 'should get just edits for a category in "creates"', () => {
			const cat = {
				id: { placeholder: 'productCategory_1' },
				label: 'test1',
				name: 'test1',
			};

			expect( getProductCategoryWithLocalEdits( state, cat.id, 'site.two' ) ).to.eql( cat );
		} );

		test( 'should get just fetched data for a category that has no edits', () => {
			expect( getProductCategoryWithLocalEdits( state, 1, 'site.one' ) ).to.eql( {
				id: 1,
				name: 'cat1',
				slug: 'cat-1',
				label: 'cat1',
				parent: 0,
			} );
		} );

		test( 'should get both fetched data and edits for a category in "updates"', () => {
			expect( getProductCategoryWithLocalEdits( state, 2, 'site.one' ) ).to.eql( {
				id: 2,
				name: 'new name',
				slug: 'cat-2',
				label: 'cat2',
				parent: 0,
			} );
		} );

		test( 'should return undefined if no category is found for category id', () => {
			expect( getProductCategoryWithLocalEdits( state, 42 ) ).to.not.exist;
			expect( getProductCategoryWithLocalEdits( state, { index: 42 } ) ).to.not.exist;
		} );
	} );

	describe( '#getProductCategoriesWithLocalEdits', () => {
		test( 'should match fetched data when there have been no edits', () => {
			expect( getProductCategoriesWithLocalEdits( state, 'site.three' ) ).to.eql( [
				{ id: 1, label: 'cat1', name: 'cat1', slug: 'cat-1', parent: 0 },
				{ id: 2, label: 'cat2', name: 'cat2', slug: 'cat-2', parent: 0 },
				{ id: 3, label: 'cat2 - cat3', name: 'cat3', slug: 'cat-3', parent: 2 },
				{ id: 4, label: 'cat2 - cat3 - cat4', name: 'cat4', slug: 'cat-4', parent: 3 },
				{ id: 5, label: 'cat5', name: 'cat5', slug: 'cat-5', parent: 0 },
				{ id: 6, label: 'cat6', name: 'cat6', slug: 'cat-6', parent: 0 },
			] );
		} );

		test( 'should contain categories in "creates"', () => {
			expect( getProductCategoriesWithLocalEdits( state, 'site.two' ) ).to.eql( [
				{
					id: { placeholder: 'productCategory_1' },
					label: 'test1',
					name: 'test1',
				},
				{ id: 5, name: 'cat5', label: 'cat5', slug: 'cat-5', parent: 0 },
				{ id: 6, name: 'cat6', label: 'cat6', slug: 'cat-6', parent: 0 },
			] );
		} );

		test( 'should contain combined categories from fetched data with "updates" overlaid', () => {
			expect( getProductCategoriesWithLocalEdits( state, 'site.one' ) ).to.eql( [
				{ id: 1, name: 'cat1', label: 'cat1', slug: 'cat-1', parent: 0 },
				{ id: 2, name: 'new name', label: 'cat2', slug: 'cat-2', parent: 0 },
			] );
		} );
	} );

	describe( '#getCurrentlyEditingProductCategory', () => {
		test( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingProductCategory( state, 'site.three' ) ).to.not.exist;
		} );

		test( 'should get the last edited category', () => {
			expect( getCurrentlyEditingProductCategory( state ) ).to.eql( {
				id: 2,
				name: 'new name',
				label: 'cat2',
				slug: 'cat-2',
				parent: 0,
			} );
		} );
	} );

	describe( '#getCurrentlyEditingId', () => {
		test( 'should return undefined if there are no edits', () => {
			expect( getCurrentlyEditingId( state, 'site.three' ) ).to.not.exist;
		} );

		test( 'should get the last edited category id for updates', () => {
			expect( getCurrentlyEditingId( state ) ).to.eql( 2 );
		} );

		test( 'should get the last edited category id for creates', () => {
			expect( getCurrentlyEditingId( state, 'site.two' ) ).to.eql( {
				placeholder: 'productCategory_1',
			} );
		} );
	} );
} );
