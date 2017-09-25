/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { productCategoryUpdated } from '../actions';
import { WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST, WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS } from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';
import reducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	it( 'should mark the product category tree as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
			siteId,
		};

		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.eql( LOADING );
	} );

	it( 'should store data from the action', () => {
		const siteId = 123;
		const state = { [ siteId ]: {
			paymentMethods: {},
			productCategories: 'LOADING',
			settings: { general: {} },
			shippingZones: {},
			products: {},
		} };
		const categories = [
			{ id: 1, name: 'cat1', slug: 'cat-1' },
			{ id: 2, name: 'cat2', slug: 'cat-2' },
		];
		const action = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
			data: categories,
			siteId,
		};

		const newState = reducer( state, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.eql( categories );
	} );

	it( 'should not affect other state trees', () => {
		const siteId = 123;
		const state = { [ siteId ]: {
			paymentMethods: {},
			productCategories: 'LOADING',
			settings: { general: {}, products: {}, stripeConnectAccount: {}, tax: {} },
			shippingZones: {},
			products: {},
		} };
		const action = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
			data: [],
			siteId,
		};

		const newState = reducer( state, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.eql( [] );
		expect( newState[ siteId ].settings ).to.eql( { general: {}, products: {}, stripeConnectAccount: {}, tax: {} } );
	} );

	it( 'should store data from an updated action', () => {
		const siteId = 123;
		const state = { [ siteId ]: {
			productCategories: 'LOADING',
		} };

		const category1 = { id: 1, name: 'Cat 1', slug: 'cat-1' };
		const action = productCategoryUpdated( siteId, category1 );

		const newState = reducer( state, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.exist;
		expect( newState[ siteId ].productCategories[ 0 ] ).to.equal( category1 );
	} );
} );
