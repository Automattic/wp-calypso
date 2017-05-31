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
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	it( 'should mark the order tree as "loading"', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_ORDERS_REQUEST,
			siteId,
		};

		const newSiteData = reducer( {}, action );
		expect( newSiteData[ siteId ].orders ).to.eql( LOADING );
	} );

	it( 'should store data from the action', () => {
		const siteId = 123;
		const orders = [ {
			id: 184,
			currency: 'USD',
			total: '40.00',
			payment_method: 'stripe',
			payment_method_title: 'Credit Card (Stripe)',
			line_items: [],
		} ];
		const action = {
			type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
			siteId,
			data: orders,
		};
		const newState = reducer( {}, action );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].orders ).to.eql( orders );
	} );

	it( 'should not affect other sites in the state', () => {
		const siteId = 123;
		const orders = [ {
			id: 184,
			currency: 'USD',
			total: '40.00',
			payment_method: 'stripe',
			payment_method_title: 'Credit Card (Stripe)',
			line_items: [],
		} ];
		const action = {
			type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
			siteId,
			data: orders,
		};
		const newState = reducer( { 234: { orders: [] } }, action );
		expect( newState[ 234 ] ).to.exist;
		expect( newState[ 234 ].orders ).to.eql( [] );
		expect( newState[ siteId ] ).to.exist;
		expect( newState[ siteId ].orders ).to.eql( orders );
	} );

	it( 'should clear the loading state on failure', () => {
		const siteId = 123;
		const action = {
			type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
			siteId,
		};
		const newState = reducer( { [ siteId ]: { orders: LOADING } }, action );
		expect( newState[ siteId ].orders ).to.be.false;
	} );
} );
