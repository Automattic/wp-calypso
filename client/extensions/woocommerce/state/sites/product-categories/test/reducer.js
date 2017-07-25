/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from 'woocommerce/state/sites/reducer';
import { LOADING, ERROR } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
} from 'woocommerce/state/action-types';
import { productCategoryUpdated } from '../actions';

describe( 'reducer', () => {
	it( 'should mark the product category list as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
			siteId,
		};

		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.eql( LOADING );
	} );

	it( 'should mark the product category list as "error"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
			siteId,
			meta: {
				dataLayer: {
					error: {
						message: 'This is an error',
					},
				},
			},
		};

		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.eql( ERROR );
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
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
			siteId,
			meta: {
				dataLayer: {
					data: {
						data: categories,
					},
				},
			},
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
			settings: { general: {}, products: {}, tax: {} },
			shippingZones: {},
			products: {},
		} };
		const action = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
			meta: {
				dataLayer: {
					data: {
						data: [],
					},
				},
			},
			siteId,
		};

		const newState = reducer( state, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].productCategories ).to.eql( [] );
		expect( newState[ siteId ].settings ).to.eql( { general: {}, products: {}, tax: {} } );
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
