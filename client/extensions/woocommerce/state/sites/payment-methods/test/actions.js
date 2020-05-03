/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchPaymentMethods } from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

describe( 'actions', () => {
	useNock( ( nock ) => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
			.query( { path: '/wc/v3/payment_gateways&_via_calypso&_method=get', json: true } )
			.reply( 200, {
				data: [
					{
						id: 'bacs',
						title: 'Direct bank transfer',
						description: 'Make your payment directly into our bank account.',
						enabled: false,
						method_title: 'BACS',
						method_description:
							'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
					},
				],
			} )
			.get( '/rest/v1.1/jetpack-blogs/456/rest-api/' )
			.query( { path: '/wc/v3/payment_gateways&_via_calypso&_method=get', json: true } )
			.reply( 200, {
				data: [
					{
						id: 'bacs',
						title: 'Direct bank transfer',
						description: 'Make your payment directly into our bank account.',
						enabled: true,
						method_title: 'BACS',
						method_description:
							'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
					},
				],
			} );
	} );

	describe( '#fetchPaymentMethods', () => {
		const siteId = '123';
		const enabled = {
			type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
			siteId: 456,
			data: [
				{
					id: 'bacs',
					title: 'Direct bank transfer',
					description: 'Make your payment directly into our bank account.',
					enabled: true,
					method_title: 'BACS',
					methodType: 'offline',
					method_description:
						'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
				},
			],
		};
		const notEnabled = {
			type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
			siteId,
			data: [
				{
					id: 'bacs',
					title: 'Direct bank transfer',
					description: 'Make your payment directly into our bank account.',
					enabled: false,
					method_title: 'BACS',
					methodType: 'offline',
					method_description:
						'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
				},
			],
		};
		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchPaymentMethods( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with payment information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchPaymentMethods( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( notEnabled );
			} );
		} );

		test( 'should add an object keyed with enabled to settings with a value of no when method is not enabled', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchPaymentMethods( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( notEnabled );
			} );
		} );

		test( 'should add an object keyed with enabled to settings with a value of yes when method is enabled', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchPaymentMethods( 456 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( enabled );
			} );
		} );

		test( 'should not dispatch if payment methods are already loading for this site', () => {
			const getState = () => ( {
				extensions: {
					woocommerce: {
						sites: {
							[ siteId ]: {
								paymentMethods: LOADING,
							},
						},
					},
				},
			} );
			const dispatch = spy();
			fetchPaymentMethods( siteId )( dispatch, getState );
			expect( dispatch ).to.not.have.been.called;
		} );
	} );
} );
