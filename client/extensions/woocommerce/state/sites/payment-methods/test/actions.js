/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchPaymentMethods, savePaymentMethod } from '../actions';
import { LOADING } from 'woocommerce/state/constants';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST,
	WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE,
	WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	useSandbox();
	useNock( ( nock ) => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
			.query( { path: '/wc/v3/payment_gateways&_method=get', json: true } )
			.reply( 200, {
				data: [ {
					id: 'bacs',
					title: 'Direct bank transfer',
					description: 'Make your payment directly into our bank account.',
					enabled: false,
					method_title: 'BACS',
					method_description: 'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
				} ]
			} )
			.get( '/rest/v1.1/jetpack-blogs/456/rest-api/' )
			.query( { path: '/wc/v3/payment_gateways&_method=get', json: true } )
			.reply( 200, {
				data: [ {
					id: 'bacs',
					title: 'Direct bank transfer',
					description: 'Make your payment directly into our bank account.',
					enabled: true,
					method_title: 'BACS',
					method_description: 'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
				} ]
			} )
			.post( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
			.query( { path: '/wc/v3/payment_gateways/paypal&_method=put', json: true } )
			.reply( 200, {
				data: {
					description: 'Pay via PayPal;',
					enabled: false,
					id: 'paypal',
					method_description: 'PayPal Standard',
					method_title: 'PayPal',
					order: '',
					settings: {
						title: {
							id: 'title',
							label: 'Title',
							value: 'PayPal'
						},
						email: {
							id: 'email',
							label: 'PayPal email'
						},
					},
					title: 'PayPal7',
				}
			} )
			.post( '/rest/v1.1/jetpack-blogs/456/rest-api/' )
			.query( { path: '/wc/v3/payment_gateways/paypal&_method=put', json: true } )
			.reply( 404, {
				data: {}
			} );
	} );

	describe( '#fetchPaymentMethods', () => {
		const siteId = '123';
		const enabled = {
			type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
			siteId: 456,
			data: [ {
				id: 'bacs',
				title: 'Direct bank transfer',
				description: 'Make your payment directly into our bank account.',
				enabled: true,
				method_title: 'BACS',
				methodType: 'offline',
				method_description: 'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
				settings: { enabled: { id: 'enabled', label: 'Enabled', type: 'checkbox', value: 'yes' } },
			} ]
		};
		const notEnabled = {
			type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST_SUCCESS,
			siteId,
			data: [ {
				id: 'bacs',
				title: 'Direct bank transfer',
				description: 'Make your payment directly into our bank account.',
				enabled: false,
				method_title: 'BACS',
				methodType: 'offline',
				method_description: 'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
				settings: { enabled: { id: 'enabled', label: 'Enabled', type: 'checkbox', value: 'no' } },
			} ]
		};
		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchPaymentMethods( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_PAYMENT_METHODS_REQUEST, siteId } );
		} );

		it( 'should dispatch a success action with payment information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchPaymentMethods( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( notEnabled );
			} );
		} );

		it( 'should add an object keyed with enabled to settings with a value of no when method is not enabled', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchPaymentMethods( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( notEnabled );
			} );
		} );

		it( 'should add an object keyed with enabled to settings with a value of yes when method is enabled', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchPaymentMethods( 456 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( enabled );
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

	describe( '#savePaymentMethod', () => {
		const siteId = '234';

		const method = {
			description: 'Pay via PayPal;',
			enabled: false,
			id: 'paypal',
			method_description: 'PayPal Standard',
			method_title: 'PayPal',
			order: '',
			settings: {
				title: {
					id: 'title',
					label: 'Title',
					value: 'PayPal'
				},
				email: {
					id: 'email',
					label: 'PayPal email'
				},
				enabled: {
					id: 'enabled',
					label: 'Enabled',
					type: 'checkbox',
					value: 'no'
				},
			},
			title: 'PayPal6',
		};

		const state = {
			extensions: {
				woocommerce: {
					sites: {
						234: {
							paymentMethods: [ method ],
						},
					},
					ui: {
						payments: {
							234: {
								methods: {
									creates: [],
									updates: [],
									deletes: [],
									currentlyEditingId: 'paypal',
									currentlyEditingChanges: { name: 'PayPal7' },
								},
							},
						},
					},
				},
			},
			ui: {
				selectedSiteId: 234,
			},
		};

		it( 'should dispatch an action', () => {
			const getState = () => ( state );
			const dispatch = spy();
			savePaymentMethod( siteId, method )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_PAYMENT_METHOD_UPDATE, siteId } );
		} );

		it( 'should dispatch a success action with payment information when request completes', () => {
			const getState = () => ( state );
			const dispatch = spy();
			const response = savePaymentMethod( siteId, method )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					siteId: '234',
					type: WOOCOMMERCE_PAYMENT_METHOD_UPDATE,
				} );
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PAYMENT_METHOD_UPDATE_SUCCESS,
					siteId,
					data: {
						description: 'Pay via PayPal;',
						enabled: false,
						fees: '2.9% + 30c per transaction',
						id: 'paypal',
						informationUrl: 'https://docs.woocommerce.com/document/paypal-standard/',
						isSuggested: true,
						methodType: 'off-site',
						method_description: 'PayPal Standard',
						method_title: 'PayPal',
						order: '',
						settings: {
							title: {
								id: 'title',
								label: 'Title',
								value: 'PayPal'
							},
							email: {
								id: 'email',
								label: 'PayPal email'
							},
							enabled: {
								id: 'enabled',
								label: 'Enabled',
								type: 'checkbox',
								value: 'no'
							},
						},
						title: 'PayPal7',
					}
				} );
			} );
		} );
	} );
} );
