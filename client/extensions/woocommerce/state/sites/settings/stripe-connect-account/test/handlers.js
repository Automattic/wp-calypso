/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	createAccount,
} from '../actions.js';
import {
	handleCreateRequest,
	handleCreateRequestSuccess,
	handleCreateRequestError,
} from '../handlers.js';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_SUCCESS,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_ERROR,
} from 'woocommerce/state/action-types';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

describe( 'handlers', () => {
	describe( '#handleCreateAccountRequest', () => {
		it( 'should dispatch a POST request', () => {
			const siteId = '123';
			const email = 'foo@bar.com';
			const country = 'US';
			const dispatch = spy();
			const action = createAccount( siteId, email, country );
			handleCreateRequest( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWithMatch( {
				type: WPCOM_HTTP_REQUEST,
				body: JSON.stringify( { email, country } ),
				method: 'POST',
				path: `/jetpack-blogs/${ siteId }/rest-api/`,
				query: {
					path: '/wc/v1/connect/stripe/account/&_method=POST',
					json: true,
					apiVersion: '1.1',
				}
			} );
		} );
	} );

	describe( '#handleCreateAccountRequestSuccess()', () => {
		it( 'should dispatch create account receive on success with the account info', () => {
			const siteId = '123';
			const email = 'foo@bar.com';
			const countryCode = 'US';
			const store = {
				dispatch: spy(),
			};
			const response = {
				data: {
					body: {
						account_id: 'acct_14qyt6Alijdnw0EA',
						success: true,
					},
					status: 200
				}
			};

			const action = createAccount( siteId, email, countryCode );
			handleCreateRequestSuccess( store, action, response );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_SUCCESS,
				connectedUserID: response.data.body.account_id,
				email,
				siteId,
			} );
		} );
	} );

	describe( '#handleCreateAccountRequestError()', () => {
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
			handleCreateRequestError( store, action, response.data.body.data.message );

			expect( store.dispatch ).calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_ERROR,
				email,
				error: response.data.body.data.message,
				siteId,
			} );
		} );
	} );
} );
