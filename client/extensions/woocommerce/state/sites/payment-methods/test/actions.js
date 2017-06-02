/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchPaymentMethods } from '../actions';
import { LOADING } from 'woocommerce/state/constants';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS,
	WOOCOMMERCE_API_FETCH_PAYMENT_METHODS_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchPaymentMethods', () => {
		const siteId = '123';

		useSandbox();
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v2/payment_gateways' } )
				.reply( 200, {
					data: [ {
						id: 'bacs',
						title: 'Direct bank transfer',
						description: 'Make your payment directly into our bank account.',
						enabled: false,
						method_title: 'BACS',
						method_description: 'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
					} ]
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchPaymentMethods( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_API_FETCH_PAYMENT_METHODS, siteId } );
		} );

		it( 'should dispatch a success action with payment information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchPaymentMethods( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_API_FETCH_PAYMENT_METHODS_SUCCESS,
					siteId,
					data: [ {
						id: 'bacs',
						title: 'Direct bank transfer',
						description: 'Make your payment directly into our bank account.',
						enabled: false,
						method_title: 'BACS',
						methodType: 'offline',
						method_description: 'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
					} ]
				} );
			} );
		} );

		it( 'should not dispatch if payment methods are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								paymentMethods: LOADING
							}
						}
					}
				}
			} );
			const dispatch = spy();
			fetchPaymentMethods( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.beenCalled;
		} );
	} );
} );
