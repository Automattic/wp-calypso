/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { createAccount, fetchAccountDetails } from '../actions.js';
import {
	handleAccountCreate,
	handleAccountCreateSuccess,
	handleAccountCreateFailure,
	handleAccountFetch,
	handleAccountFetchSuccess,
	handleAccountFetchFailure,
} from '../handlers.js';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	describe( '#handleCreateAccountRequest', () => {
		test( 'should dispatch a POST request', () => {
			const siteId = '123';
			const email = 'foo@bar.com';
			const country = 'US';
			const dispatch = spy();
			const action = createAccount( siteId, email, country );
			handleAccountCreate( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: WPCOM_HTTP_REQUEST,
				body: {
					path: '/wc/v1/connect/stripe/account/&_method=POST',
					body: JSON.stringify( { email, country } ),
				},
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					json: true,
					apiVersion: '1.1',
				},
			} );
		} );
	} );

	describe( '#handleAccountCreateSuccess()', () => {
		test( 'should dispatch create account receive on success with the account info', () => {
			const siteId = '123';
			const email = 'foo@bar.com';
			const countryCode = 'US';
			const store = {
				dispatch: spy(),
			};
			const response = {
				data: {
					account_id: 'acct_14qyt6Alijdnw0EA',
					success: true,
				},
			};

			const action = createAccount( siteId, email, countryCode );
			handleAccountCreateSuccess( store, action, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				connectedUserID: response.data.account_id,
				siteId,
			} );
		} );
	} );

	describe( '#handleAccountCreateFailure()', () => {
		test( 'should dispatch create account error', () => {
			const siteId = '123';
			const email = 'foo@bar.com';
			const countryCode = 'US';
			const store = {
				dispatch: spy(),
			};
			const response = {
				data: {
					body: {
						data: {
							message: 'An account using that email address already exists.',
						},
						success: false,
					},
					status: 400,
				},
			};

			const action = createAccount( siteId, email, countryCode );
			handleAccountCreateFailure( store, action, response.data.body.data.message );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				error: response.data.body.data.message,
				siteId,
			} );
		} );
	} );

	describe( '#handleAccountFetchRequest', () => {
		test( 'should dispatch a GET request', () => {
			const siteId = '123';
			const dispatch = spy();
			const action = fetchAccountDetails( siteId );
			handleAccountFetch( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: WPCOM_HTTP_REQUEST,
				method: 'GET',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					apiVersion: '1.1',
					json: true,
					path: '/wc/v1/connect/stripe/account/&_method=GET',
				},
			} );
		} );
	} );

	describe( '#handleAccountFetchSuccess()', () => {
		test( 'should dispatch update account details on success with the account info', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
			const response = {
				data: {
					account_id: 'acct_14qyt6Alijdnw0EA',
					display_name: 'Foo Bar',
					email: 'foo@bar.com',
					payouts_enabled: true,
					legal_entity: {
						first_name: 'Foo',
						last_name: 'Bar',
					},
					business_logo: 'http://bar.com/foo.png',
					success: true,
				},
			};

			const action = fetchAccountDetails( siteId );
			handleAccountFetchSuccess( store, action, response );
			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
				connectedUserID: response.data.account_id,
				displayName: 'Foo Bar',
				email: 'foo@bar.com',
				firstName: 'Foo',
				isActivated: true,
				lastName: 'Bar',
				logo: 'http://bar.com/foo.png',
				siteId,
			} );
		} );
	} );

	describe( '#handleAccountFetchFailure()', () => {
		test( 'should dispatch update account details error', () => {
			const siteId = '123';
			const store = {
				dispatch: spy(),
			};
			const response = {
				data: {
					body: {
						data: {
							message: '.',
						},
						success: false,
					},
					status: 400,
				},
			};

			const action = fetchAccountDetails( siteId );
			handleAccountFetchFailure( store, action, response.data.body.data.message );
			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
				error: response.data.body.data.message,
				siteId,
			} );
		} );
	} );
} );
