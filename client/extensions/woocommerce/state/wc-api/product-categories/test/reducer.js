/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../../reducer';
import wcReducer from '../../../reducer';
import {
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
} from 'woocommerce/state/action-types';
import { fetchProductCategoriesSuccess } from '../actions';

describe( 'fetchProductCategories', () => {
	it( 'should only create a site node', () => {
		const siteId = 123;
		const state = {};

		const newSiteData = reducer( state, { type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES, payload: { siteId } } );
		expect( newSiteData[ siteId ] ).to.eql( {} );
	} );
} );

describe( 'fetchProductCategoriesSuccess', () => {
	it( 'should store data from the action', () => {
		const siteId = 123;
		const state = {};

		const categories = [
			{ id: 1, name: 'cat1', slug: 'cat-1' },
			{ id: 2, name: 'cat2', slug: 'cat-2' },
		];
		const newState = reducer( state, fetchProductCategoriesSuccess( siteId, categories ) );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.equal( categories );
	} );

	it( 'should not allow invalid category objects', () => {
		const siteId = 123;
		const state = {};

		const missingId = [
			{ id: 12, name: 'ok', slug: 'ok' },
			{ name: 'badId', slug: 'bad-id' },
		];

		const missingName = [
			{ id: 12, name: 'ok', slug: 'ok' },
			{ id: 13, slug: 'missing-name' },
		];

		const missingSlug = [
			{ id: 12, name: 'ok', slug: 'ok' },
			{ id: 13, name: 'Missing Slug' },
		];

		const badId = [
			{ id: 12, name: 'ok', slug: 'ok' },
			{ id: 'bad', name: 'Bad Id', slug: 'bad-id' },
		];

		const badName = [
			{ id: 12, name: 'ok', slug: 'ok' },
			{ id: 13, name: 12.3, slug: 'bad-name' },
		];

		const badSlug = [
			{ id: 12, name: 'ok', slug: 'ok' },
			{ id: 13, name: 'Bad Slug', slug: 15 },
		];

		let newState = wcReducer( state, fetchProductCategoriesSuccess( siteId, missingId ) );
		expect( newState.site[ siteId ].status.wcApi.error.data.message ).to.equal( 'Invalid Categories Array' );

		newState = wcReducer( state, fetchProductCategoriesSuccess( siteId, missingName ) );
		expect( newState.site[ siteId ].status.wcApi.error.data.message ).to.equal( 'Invalid Categories Array' );

		newState = wcReducer( state, fetchProductCategoriesSuccess( siteId, missingSlug ) );
		expect( newState.site[ siteId ].status.wcApi.error.data.message ).to.equal( 'Invalid Categories Array' );

		newState = wcReducer( state, fetchProductCategoriesSuccess( siteId, badId ) );
		expect( newState.site[ siteId ].status.wcApi.error.data.message ).to.equal( 'Invalid Categories Array' );

		newState = wcReducer( state, fetchProductCategoriesSuccess( siteId, badName ) );
		expect( newState.site[ siteId ].status.wcApi.error.data.message ).to.equal( 'Invalid Categories Array' );

		newState = wcReducer( state, fetchProductCategoriesSuccess( siteId, badSlug ) );
		expect( newState.site[ siteId ].status.wcApi.error.data.message ).to.equal( 'Invalid Categories Array' );
	} );
} );

