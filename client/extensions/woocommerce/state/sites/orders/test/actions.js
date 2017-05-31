/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchOrders } from '../actions';
import { LOADING } from 'woocommerce/state/constants';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// The assembler `createOrderObject` fills out these fields on the order object.
const formattedOrder = {
	date_created: null,
	date_modified: null,
	date_paid: null,
	date_completed: null,
	line_items: [],
	prices_include_tax: false,
	totalPriceText: '',
};

describe( 'actions', () => {
	describe( '#fetchSettingsGeneral()', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v2/orders&_method=get' } )
				.reply( 200, {
					data: [
						{ id: 1, total: '20.00' },
						{ id: 2, total: '35.00' }
					]
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v2/orders&_method=get' } )
				.reply( 402, {
					error: 'rest_no_route',
					message: 'No route was found matching the URL and request method',
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchOrders( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_ORDERS_REQUEST, siteId } );
		} );

		it( 'should dispatch a success action with orders list when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchOrders( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
					siteId,
					data: [
						{ ...formattedOrder, id: 1, total: '20.00' },
						{ ...formattedOrder, id: 2, total: '35.00' }
					]
				} );
			} );
		} );

		it( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchOrders( 234 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
					siteId: 234,
				} );
			} );
		} );

		it( 'should not dispatch if orders are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								orders: LOADING
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchOrders( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
