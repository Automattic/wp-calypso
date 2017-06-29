/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchNotes } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import notes from './fixtures/notes';

describe( 'actions', () => {
	describe( '#fetchNotes()', () => {
		const siteId = '123';
		const orderId = 45;

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wc/v3/orders/45/notes&_method=get', json: true } )
				.reply( 200, {
					data: notes,
				} )
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wc/v3/orders/0/notes&_method=get', json: true } )
				.reply( 404, {
					data: {
						message: 'Invalid order ID.',
						error: 'woocommerce_rest_shop_order_invalid_id',
						status: 404,
					}
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchNotes( siteId, orderId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_ORDER_NOTES_REQUEST, siteId, orderId } );
		} );

		it( 'should dispatch a success action with the notes list when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchNotes( siteId, orderId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
					siteId,
					orderId,
					notes,
				} );
			} );
		} );

		it( 'should dispatch a failure action with the error when a the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchNotes( siteId, 0 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
					siteId,
				} );
			} );
		} );

		it( 'should not dispatch if notes are already loading for this site/order', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								orders: {
									notes: {
										isLoading: {
											[ orderId ]: true,
										},
									}
								}
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchNotes( siteId, orderId )( dispatch, getState );
			expect( dispatch ).to.not.have.been.called;
		} );
	} );
} );
