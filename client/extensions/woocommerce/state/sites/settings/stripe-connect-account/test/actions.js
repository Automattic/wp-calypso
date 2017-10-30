/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	clearError,
	createAccount,
	deauthorizeAccount,
	fetchAccountDetails,
	oauthInit,
} from '../actions';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_ERROR,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#clearError()', () => {
		const siteId = '123';

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			clearError( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#createAccount()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v1/connect/stripe/account&_method=post', json: true } )
				.reply( 200, {
					data: {
						success: true,
						account_id: 'acct_14qyt6Alijdnw0EA',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			createAccount( siteId, 'foo@bar.com', 'US' )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
				country: 'US',
				email: 'foo@bar.com',
				siteId,
			} );
		} );

		test( 'should dispatch a success action with account details when the request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = createAccount( siteId, 'foo@bar.com', 'US' )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
					siteId,
					connectedUserID: 'acct_14qyt6Alijdnw0EA',
					email: 'foo@bar.com',
				} );
			} );
		} );
	} );

	describe( '#fetchAccountDetails()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v1/connect/stripe/account&_method=get', json: true } )
				.reply( 200, {
					data: {
						success: true,
						account_id: 'acct_14qyt6Alijdnw0EA',
						display_name: 'Foo Bar',
						email: 'foo@bar.com',
						legal_entity: {
							first_name: 'Foo',
							last_name: 'Bar',
						},
						payouts_enabled: true,
						business_logo: 'https://foo.com/bar.png',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchAccountDetails( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
				siteId,
			} );
		} );

		test( 'should dispatch a success action with account details when the request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchAccountDetails( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
					siteId,
					connectedUserID: 'acct_14qyt6Alijdnw0EA',
					displayName: 'Foo Bar',
					email: 'foo@bar.com',
					firstName: 'Foo',
					isActivated: true,
					logo: 'https://foo.com/bar.png',
					lastName: 'Bar',
				} );
			} );
		} );
	} );

	describe( 'actions', () => {
		describe( '#deauthorizeAccount()', () => {
			const siteId = '123';

			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
					.query( { path: '/wc/v1/connect/stripe/account/deauthorize&_method=post', json: true } )
					.reply( 200, {
						data: {
							success: true,
							account_id: 'acct_14qyt6Alijdnw0EA',
						},
					} );
			} );

			test( 'should dispatch an action', () => {
				const getState = () => ( {} );
				const dispatch = spy();
				deauthorizeAccount( siteId )( dispatch, getState );
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
					siteId,
				} );
			} );

			test( 'should dispatch a success action when the request completes', () => {
				const getState = () => ( {} );
				const dispatch = spy();
				const response = deauthorizeAccount( siteId )( dispatch, getState );

				return response.then( () => {
					expect( dispatch ).to.have.been.calledWith( {
						type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
						siteId,
					} );
				} );
			} );
		} );
	} );

	describe( '#oauthInit()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v1/connect/stripe/oauth/init&_method=post', json: true } )
				.reply( 200, {
					data: {
						success: true,
						oauthUrl:
							'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=xxx&scope=read_write&state=yyy',
					},
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			oauthInit( siteId, 'https://return.url.com/' )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT,
				returnUrl: 'https://return.url.com/',
				siteId,
			} );
		} );

		test( 'should dispatch a success action with a Stripe URL when the request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = oauthInit( siteId, 'https://return.url.com/' )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
					siteId,
					oauthUrl:
						'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=xxx&scope=read_write&state=yyy',
				} );
			} );
		} );
	} );
} );
