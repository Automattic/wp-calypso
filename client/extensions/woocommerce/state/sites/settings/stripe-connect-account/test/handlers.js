/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { createAccount } from '../actions.js';
import { handleAccountCreate, handleAccountCreateSuccess, handleAccountCreateFailure } from '../handlers.js';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import { WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE } from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	describe( '#handleCreateAccountRequest', () => {
		it( 'should dispatch a POST request', () => {
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
				}
			} );
		} );
	} );

	describe( '#handleAccountCreateSuccess()', () => {
		it( 'should dispatch create account receive on success with the account info', () => {
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
				}
			};

			const action = createAccount( siteId, email, countryCode );
			handleAccountCreateSuccess( store, action, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				connectedUserID: response.data.account_id,
				email,
				siteId,
			} );
		} );
	} );

	describe( '#handleAccountCreateFailure()', () => {
		it( 'should dispatch create account error', () => {
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
							message: 'An account using that email address already exists.'
						},
						success: false,
					},
					status: 400
				}
			};

			const action = createAccount( siteId, email, countryCode );
			handleAccountCreateFailure( store, action, response.data.body.data.message );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				email,
				error: response.data.body.data.message,
				siteId,
			} );
		} );
	} );
} );
