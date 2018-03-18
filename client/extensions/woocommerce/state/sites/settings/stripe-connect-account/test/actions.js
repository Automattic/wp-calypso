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
	clearCompletedNotification,
	clearError,
	createAccount,
	deauthorizeAccount,
	fetchAccountDetails,
	oauthInit,
	oauthConnect,
} from '../actions';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_COMPLETED_NOTIFICATION,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_ERROR,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#clearCompletedNotification()', () => {
		const siteId = '123';

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			clearCompletedNotification( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_COMPLETED_NOTIFICATION,
				siteId,
			} );
		} );
	} );

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
				.query( { path: '/wc/v1/connect/stripe/account&_via_calypso&_method=post', json: true } )
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
				.query( { path: '/wc/v1/connect/stripe/account&_via_calypso&_method=get', json: true } )
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

	describe( '#deauthorizeAccount()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( {
					path: '/wc/v1/connect/stripe/account/deauthorize&_via_calypso&_method=post',
					json: true,
				} )
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

	describe( '#oauthInit()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v1/connect/stripe/oauth/init&_via_calypso&_method=post', json: true } )
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

	describe( '#oauthConnect()', () => {
		const siteId = '123';

		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( {
					path: '/wc/v1/connect/stripe/oauth/connect&_via_calypso&_method=post',
					json: true,
				} )
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
			oauthConnect( siteId, 'STRIPECODE', 'STRIPESTATE' )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT,
				stripeCode: 'STRIPECODE',
				stripeState: 'STRIPESTATE',
				siteId,
			} );
		} );

		test( 'should dispatch a success action with a Stripe account when the request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = oauthConnect( siteId, 'STRIPECODE', 'STRIPESTATE' )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
					connectedUserID: 'acct_14qyt6Alijdnw0EA',
					siteId,
				} );
			} );
		} );
	} );
} );
