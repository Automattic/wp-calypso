/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import stripeConnectAccountReducer from '../reducer';
import sitesReducer from 'woocommerce/state/sites/reducer';
import {
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
	WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'default stripeConnectAccount reducer behavior', () => {
		it( 'should have no change by default', () => {
			const newState = stripeConnectAccountReducer( {}, {} );
			expect( newState ).to.eql( {} );
		} );
	} );

	describe( 'connectAccountCreate', () => {
		it( 'should update state to show request in progress', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.isRequesting ).to.eql( true );
		} );

		it( 'should only update the request in progress flag for the appropriate siteId', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE,
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

	describe( 'connectAccountCreateComplete', () => {
		it( 'should update state with the received account details', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				email: 'foo@bar.com',
				siteId: 123,
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState ).to.eql( {
				connectedUserID: 'acct_14qyt6Alijdnw0EA',
				email: 'foo@bar.com',
				error: '',
				isActivated: false,
				isRequesting: false,
			} );
		} );

		it( 'should leave other sites state unchanged', () => {
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

	describe( 'receivingAccountCreationError', () => {
		it( 'should reset the isRequesting flag in state', () => {
			const action = {
				type: WOOCOMMERCE_SETTINGS_STRIPE_CONNECT_ACCOUNT_CREATE_COMPLETE,
				siteId: 123,
				email: 'foo@bar.com',
				error: 'My error',
			};
			const newState = stripeConnectAccountReducer( undefined, action );
			expect( newState.error ).to.eql( 'My error' );
			expect( newState.email ).to.eql( 'foo@bar.com' );
			expect( newState.isRequesting ).to.eql( false );
		} );

		it( 'should leave other sites state unchanged', () => {
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
} );
