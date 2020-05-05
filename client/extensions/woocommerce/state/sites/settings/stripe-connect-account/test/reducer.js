/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import stripeConnectAccountReducer from '../reducer';
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
import sitesReducer from 'woocommerce/state/sites/reducer';

describe( 'reducer', () => {
	describe( 'default stripeConnectAccount reducer behavior', () => {
		test( 'should have no change by default', () => {
			const newState = stripeConnectAccountReducer( {}, {} );
			expect( newState ).to.eql( {} );
		} );
	} );

	describe( 'clearCompletedNotification', () => {
		test( 'should reset flag in state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_COMPLETED_NOTIFICATION,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( { notifyCompleted: true }, action );
			expect( newState.notifyCompleted ).to.eql( false );
		} );
	} );

	describe( 'clearError', () => {
		test( 'should reset error in state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CLEAR_ERROR,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( { error: 'My error message' }, action );
			expect( newState.error ).to.eql( '' );
		} );
	} );

	describe( 'connectAccountCreate', () => {
		test( 'should update state to show request in progress', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.isCreating ).to.eql( true );
		} );

		test( 'should only update the request in progress flag for the appropriate siteId', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								isCreating: false,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								isCreating: false,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isCreating ).to.eql( true );
			expect( newState[ 456 ].settings.stripeConnectAccount.isCreating ).to.eql( false );
		} );
	} );

	describe( 'connectAccountCreateComplete', () => {
		test( 'should update state with the received account details', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				email: 'foo@bar.com',
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState ).to.eql( {
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				displayName: '',
				email: 'foo@bar.com',
				error: '',
				firstName: '',
				isActivated: false,
				isCreating: false,
				isRequesting: false,
				lastName: '',
				logo: '',
				notifyCompleted: true,
			} );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				email: 'foo@bar.com',
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								email: '',
								isActivated: false,
								isCreating: true,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								email: '',
								isActivated: false,
								isCreating: true,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isCreating ).to.eql( false );
			expect( newState[ 123 ].settings.stripeConnectAccount.connectedUserID ).to.eql(
				'acct_14qyt6Alijdnw0EA'
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.email ).to.eql( 'foo@bar.com' );
			expect( newState[ 456 ].settings.stripeConnectAccount.isCreating ).to.eql( true );
		} );
	} );

	describe( 'connectAccountCreateError', () => {
		test( 'should reset the isCreating flag in state and store the email and error', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				siteId: 123,
				email: 'foo@bar.com',
				error: 'My error',
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.error ).to.eql( 'My error' );
			expect( newState.email ).to.eql( 'foo@bar.com' );
			expect( newState.isCreating ).to.eql( false );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				siteId: 123,
				email: 'foo@bar.com',
				error: 'My error',
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								isCreating: true,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								isCreating: true,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isCreating ).to.eql( false );
			expect( newState[ 456 ].settings.stripeConnectAccount.isCreating ).to.eql( true );
		} );
	} );

	describe( 'connectAccountFetch', () => {
		test( 'should update state to show request in progress', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.isRequesting ).to.eql( true );
		} );

		test( 'should only update the request in progress flag for the appropriate siteId', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_REQUEST,
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								email: '',
								isActivated: false,
								isRequesting: false,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								email: '',
								isActivated: false,
								isRequesting: false,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isRequesting ).to.eql( true );
			expect( newState[ 456 ].settings.stripeConnectAccount.isRequesting ).to.eql( false );
		} );
	} );

	describe( 'connectAccountFetchComplete', () => {
		test( 'should update state with the received account details', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				displayName: 'Foo Bar',
				email: 'foo@bar.com',
				firstName: 'Foo',
				isActivated: false,
				lastName: 'Bar',
				logo: 'http://bar.com/foo.png',
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState ).to.eql( {
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				displayName: 'Foo Bar',
				email: 'foo@bar.com',
				error: '',
				firstName: 'Foo',
				isActivated: false,
				isDeauthorizing: false,
				isRequesting: false,
				lastName: 'Bar',
				logo: 'http://bar.com/foo.png',
			} );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				email: 'foo@bar.com',
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								email: '',
								isActivated: false,
								isRequesting: true,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								email: '',
								isActivated: false,
								isRequesting: true,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isRequesting ).to.eql( false );
			expect( newState[ 123 ].settings.stripeConnectAccount.connectedUserID ).to.eql(
				'acct_14qyt6Alijdnw0EA'
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.email ).to.eql( 'foo@bar.com' );
			expect( newState[ 456 ].settings.stripeConnectAccount.isRequesting ).to.eql( true );
		} );
	} );

	describe( 'connectAccountFetchError', () => {
		test( 'should reset the isRequesting flag in state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
				siteId: 123,
				email: 'foo@bar.com',
				error: 'My error',
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.error ).to.eql( 'My error' );
			expect( newState.email ).to.eql( 'foo@bar.com' );
			expect( newState.isRequesting ).to.eql( false );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DETAILS_UPDATE,
				siteId: 123,
				email: 'foo@bar.com',
				error: 'My error',
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								email: '',
								isActivated: false,
								isRequesting: true,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								email: '',
								isActivated: false,
								isRequesting: true,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isRequesting ).to.eql( false );
			expect( newState[ 456 ].settings.stripeConnectAccount.isRequesting ).to.eql( true );
		} );
	} );

	describe( 'connectAccountDeauthorize', () => {
		test( 'should update state to show request in progress', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.isDeauthorizing ).to.eql( true );
		} );

		test( 'should only update the request in progress flag for the appropriate siteId', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE,
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								isDeauthorizing: false,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								isDeauthorizing: false,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isDeauthorizing ).to.eql( true );
			expect( newState[ 456 ].settings.stripeConnectAccount.isDeauthorizing ).to.eql( false );
		} );
	} );

	describe( 'connectAccountDeauthorizeComplete Success', () => {
		test( 'should update state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState ).to.eql( {
				connectedUserID: '',
				displayName: '',
				email: '',
				error: '',
				firstName: '',
				isActivated: false,
				isDeauthorizing: false,
				isRequesting: false,
				lastName: '',
				logo: '',
			} );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: 'acct_25rzu7Alijdnw0FB',
								displayName: 'Bar Foo',
								email: 'bar@foo.com',
								error: '',
								firstName: 'Bar',
								isActivated: false,
								isDeauthorizing: true,
								isRequesting: false,
								lastName: 'Foo',
								logo: '',
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: 'acct_14qyt6Alijdnw0EA',
								displayName: 'Foo Bar',
								email: 'foo@bar.com',
								error: '',
								firstName: 'Foo',
								isActivated: false,
								isDeauthorizing: true,
								isRequesting: false,
								lastName: 'Bar',
								logo: '',
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isDeauthorizing ).to.eql( false );
			expect( newState[ 123 ].settings.stripeConnectAccount.connectedUserID ).to.eql( '' );
			expect( newState[ 456 ].settings.stripeConnectAccount.isDeauthorizing ).to.eql( true );
			expect( newState[ 456 ].settings.stripeConnectAccount.connectedUserID ).to.eql(
				'acct_14qyt6Alijdnw0EA'
			);
		} );
	} );

	describe( 'connectAccountDeauthorizeComplete w/ Error', () => {
		test( 'should set the error in state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
				siteId: 123,
				error: 'My error message',
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.error ).to.eql( 'My error message' );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_DEAUTHORIZE_COMPLETE,
				siteId: 123,
				error: 'My error message',
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: 'acct_14qyt6Alijdnw0EA',
								displayName: 'Foo Bar',
								email: 'foo@bar.com',
								error: '',
								firstName: 'Foo',
								isActivated: false,
								isDeauthorizing: true,
								isRequesting: false,
								lastName: 'Bar',
								logo: '',
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: 'acct_14qyt6Alijdnw0EA',
								displayName: 'Foo Bar',
								email: 'foo@bar.com',
								error: '',
								firstName: 'Foo',
								isActivated: false,
								isDeauthorizing: true,
								isRequesting: false,
								lastName: 'Bar',
								logo: '',
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.error ).to.eql( 'My error message' );
			expect( newState[ 123 ].settings.stripeConnectAccount.isDeauthorizing ).to.eql( false );
			expect( newState[ 456 ].settings.stripeConnectAccount.error ).to.eql( '' );
			expect( newState[ 456 ].settings.stripeConnectAccount.isDeauthorizing ).to.eql( true );
		} );
	} );

	describe( 'connectAccountOAuthInit', () => {
		test( 'should update state to show request in progress', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.isOAuthInitializing ).to.eql( true );
		} );

		test( 'should only update the request in progress flag for the appropriate siteId', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT,
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								isOAuthInitializing: false,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								isOAuthInitializing: false,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isOAuthInitializing ).to.eql( true );
			expect( newState[ 456 ].settings.stripeConnectAccount.isOAuthInitializing ).to.eql( false );
		} );
	} );

	describe( 'connectAccountOAuthInitComplete Success', () => {
		test( 'should update state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
				oauthUrl: 'https://connect.stripe.com/oauth/authorize',
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState ).to.eql( {
				error: '',
				isOAuthInitializing: false,
				oauthUrl: 'https://connect.stripe.com/oauth/authorize',
			} );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
				oauthUrl: 'https://connect.stripe.com/oauth/authorize',
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: 'acct_25rzu7Alijdnw0FB',
								displayName: 'Bar Foo',
								email: 'bar@foo.com',
								error: '',
								firstName: 'Bar',
								isActivated: false,
								isDeauthorizing: false,
								isOAuthInitializing: true,
								isRequesting: false,
								lastName: 'Foo',
								logo: '',
								oauthUrl: 'https://connect.stripe.com/oauth/authorize',
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: 'acct_14qyt6Alijdnw0EA',
								displayName: 'Foo Bar',
								email: 'foo@bar.com',
								error: '',
								firstName: 'Foo',
								isActivated: false,
								isDeauthorizing: true,
								isOAuthInitializing: false,
								isRequesting: false,
								lastName: 'Bar',
								logo: '',
								oauthUrl: '',
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isOAuthInitializing ).to.eql( false );
			expect( newState[ 123 ].settings.stripeConnectAccount.oauthUrl ).to.eql(
				'https://connect.stripe.com/oauth/authorize'
			);
			expect( newState[ 456 ].settings.stripeConnectAccount.isOAuthInitializing ).to.eql( false );
			expect( newState[ 456 ].settings.stripeConnectAccount.oauthUrl ).to.eql( '' );
		} );
	} );

	describe( 'connectAccountOAuthInitComplete w/ Error', () => {
		test( 'should set the error in state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
				siteId: 123,
				error: 'My error message',
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.error ).to.eql( 'My error message' );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_INIT_COMPLETE,
				siteId: 123,
				error: 'My error message',
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: 'acct_14qyt6Alijdnw0EA',
								displayName: 'Foo Bar',
								email: 'foo@bar.com',
								error: '',
								firstName: 'Foo',
								isActivated: false,
								isDeauthorizing: false,
								isOAuthInitializing: true,
								isRequesting: false,
								lastName: 'Bar',
								logo: '',
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: 'acct_14qyt6Alijdnw0EA',
								displayName: 'Foo Bar',
								email: 'foo@bar.com',
								error: '',
								firstName: 'Foo',
								isActivated: false,
								isDeauthorizing: false,
								isOAuthInitializing: true,
								isRequesting: false,
								lastName: 'Bar',
								logo: '',
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.error ).to.eql( 'My error message' );
			expect( newState[ 123 ].settings.stripeConnectAccount.isOAuthInitializing ).to.eql( false );
			expect( newState[ 456 ].settings.stripeConnectAccount.error ).to.eql( '' );
			expect( newState[ 456 ].settings.stripeConnectAccount.isOAuthInitializing ).to.eql( true );
		} );
	} );

	describe( 'connectAccountOAuthConnect', () => {
		test( 'should update state to show request in progress', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.isOAuthConnecting ).to.eql( true );
		} );

		test( 'should only update the request in progress flag for the appropriate siteId', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT,
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								isOAuthConnecting: false,
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								isOAuthConnecting: false,
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isOAuthConnecting ).to.eql( true );
			expect( newState[ 456 ].settings.stripeConnectAccount.isOAuthConnecting ).to.eql( false );
		} );
	} );

	describe( 'connectAccountOAuthConnectComplete Success', () => {
		test( 'should update state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState ).to.eql( {
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				email: '',
				error: '',
				firstName: '',
				isActivated: false,
				isCreating: false,
				isOAuthConnecting: false,
				isRequesting: false,
				lastName: '',
				logo: '',
				notifyCompleted: true,
			} );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				siteId: 123,
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								displayName: '',
								email: '',
								error: '',
								firstName: '',
								isActivated: false,
								isDeauthorizing: false,
								isOAuthConnecting: true,
								isOAuthInitializing: false,
								isRequesting: false,
								lastName: '',
								logo: '',
								oauthUrl: '',
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								displayName: '',
								email: '',
								error: '',
								firstName: '',
								isActivated: false,
								isDeauthorizing: false,
								isOAuthConnecting: true,
								isOAuthInitializing: false,
								isRequesting: false,
								lastName: '',
								logo: '',
								oauthUrl: '',
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.isOAuthConnecting ).to.eql( false );
			expect( newState[ 123 ].settings.stripeConnectAccount.connectedUserID ).to.eql(
				'acct_14qyt6Alijdnw0EA'
			);
			expect( newState[ 456 ].settings.stripeConnectAccount.isOAuthConnecting ).to.eql( true );
			expect( newState[ 456 ].settings.stripeConnectAccount.connectedUserID ).to.eql( '' );
		} );
	} );

	describe( 'connectAccountOAuthConnectComplete w/ Error', () => {
		test( 'should set the error in state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
				siteId: 123,
				error: 'My error message',
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.error ).to.eql( 'My error message' );
		} );

		test( 'should leave other sites state unchanged', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_OAUTH_CONNECT_COMPLETE,
				siteId: 123,
				error: 'My error message',
			};
			const newState = sitesReducer(
				{
					123: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								displayName: 'Foo Bar',
								email: 'foo@bar.com',
								error: '',
								firstName: 'Foo',
								isActivated: false,
								isDeauthorizing: false,
								isOAuthConnecting: true,
								isOAuthInitializing: false,
								isRequesting: false,
								lastName: 'Bar',
								logo: '',
							},
						},
					},
					456: {
						settings: {
							stripeConnectAccount: {
								connectedUserID: '',
								displayName: 'Foo Bar',
								email: 'foo@bar.com',
								error: '',
								firstName: 'Foo',
								isActivated: false,
								isDeauthorizing: false,
								isOAuthConnecting: true,
								isOAuthInitializing: false,
								isRequesting: false,
								lastName: 'Bar',
								logo: '',
							},
						},
					},
				},
				action
			);
			expect( newState[ 123 ].settings.stripeConnectAccount.error ).to.eql( 'My error message' );
			expect( newState[ 123 ].settings.stripeConnectAccount.isOAuthConnecting ).to.eql( false );
			expect( newState[ 456 ].settings.stripeConnectAccount.error ).to.eql( '' );
			expect( newState[ 456 ].settings.stripeConnectAccount.isOAuthConnecting ).to.eql( true );
		} );
	} );
} );
