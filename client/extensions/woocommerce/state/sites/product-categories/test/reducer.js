/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from 'woocommerce/state/sites/reducer';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
	WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should mark the product category tree as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES,
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
			settingsGeneral: {},
			shippingZones: {},
			products: {},
		} };
		const categories = [
			{ id: 1, name: 'cat1', slug: 'cat-1' },
			{ id: 2, name: 'cat2', slug: 'cat-2' },
		];
		const action = {
			type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
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
			settingsGeneral: {},
			shippingZones: {},
			products: {},
		} };
		const action = {
			type: WOOCOMMERCE_API_FETCH_PRODUCT_CATEGORIES_SUCCESS,
			data: [],
			siteId,
		};

		const newState = reducer( state, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.eql( [] );
		expect( newState[ siteId ].settingsGeneral ).to.eql( {} );
	} );
} );
