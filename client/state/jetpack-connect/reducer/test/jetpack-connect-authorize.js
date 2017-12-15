/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import jetpackConnectAuthorize from '../jetpack-connect-authorize.js';
import {
	DESERIALIZE,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
	JETPACK_CONNECT_QUERY_SET,
	JETPACK_CONNECT_REDIRECT_WP_ADMIN,
	JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL,
	SERIALIZE,
	SITE_REQUEST_FAILURE,
} from 'state/action-types';

import { useSandbox } from 'test/helpers/use-sinon';

describe( '#jetpackConnectAuthorize()', () => {
	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should default to an empty object', () => {
		const state = jetpackConnectAuthorize( undefined, {} );
		expect( state ).toEqual( {} );
	} );

	test( 'should set isAuthorizing to true when starting authorization', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_AUTHORIZE,
		} );

		expect( state ).toEqual( {
			isAuthorizing: true,
			authorizeSuccess: false,
			authorizeError: false,
			isRedirectingToWpAdmin: false,
			autoAuthorize: false,
		} );
	} );

	test( 'should omit userData and bearerToken when starting authorization', () => {
		const state = jetpackConnectAuthorize(
			{
				userData: {
					ID: 123,
					email: 'example@example.com',
				},
				bearerToken: 'abcd1234',
			},
			{
				type: JETPACK_CONNECT_AUTHORIZE,
			}
		);

		expect( state ).not.toHaveProperty( 'userData' );
		expect( state ).not.toHaveProperty( 'bearerToken' );
	} );

	test( 'should set authorizeSuccess to true when completed authorization successfully', () => {
		const data = {
			plans_url: 'https://wordpress.com/jetpack/connect/plans/',
		};
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
			data,
		} );

		expect( state ).toMatchObject( {
			authorizeError: false,
			authorizeSuccess: true,
			autoAuthorize: false,
			plansUrl: data.plans_url,
			siteReceived: false,
		} );
	} );

	test( 'should set authorizeSuccess to false when an error occurred during authorization', () => {
		const error = 'You need to stay logged in to your WordPress blog while you authorize Jetpack.';
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
			error,
		} );

		expect( state ).toEqual( {
			isAuthorizing: false,
			authorizeError: error,
			authorizeSuccess: false,
			autoAuthorize: false,
		} );
	} );

	test( 'should set authorization code when login is completed', () => {
		const code = 'abcd1234efgh5678';
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
			data: {
				code,
			},
		} );

		expect( state ).toEqual( { authorizationCode: code } );
	} );

	test( 'should set siteReceived to true when received site list', () => {
		const state = jetpackConnectAuthorize(
			{
				siteReceived: false,
				isAuthorizing: true,
			},
			{
				type: JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
			}
		);

		expect( state ).toMatchObject( {
			siteReceived: true,
			isAuthorizing: false,
		} );
	} );

	test( 'should populate state with provided values', () => {
		const clientId = 12345;
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_QUERY_SET,
			clientId,
		} );

		expect( state ).toMatchObject( {
			clientId,
			authorizeError: false,
			authorizeSuccess: false,
			isAuthorizing: false,
			timestamp: expect.any( Number ),
		} );
	} );

	test( 'should set isAuthorizing and autoAuthorize to true when initiating an account creation', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_CREATE_ACCOUNT,
		} );

		expect( state ).toEqual( {
			isAuthorizing: true,
			authorizeSuccess: false,
			authorizeError: false,
			autoAuthorize: true,
		} );
	} );

	test( 'should receive userData and bearerToken on successful account creation', () => {
		const userData = {
			ID: 123,
			email: 'example@example.com',
		};
		const bearer_token = 'abcd1234';
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
			userData,
			data: {
				bearer_token,
			},
		} );

		expect( state ).toMatchObject( {
			isAuthorizing: true,
			authorizeSuccess: false,
			authorizeError: false,
			autoAuthorize: true,
			userData: userData,
			bearerToken: bearer_token,
		} );
	} );

	test( 'should mark authorizeError as true on unsuccessful account creation', () => {
		const error = 'Sorry, that username already exists!';
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
			error,
		} );

		expect( state ).toEqual( {
			authorizeError: true,
			authorizeSuccess: false,
			autoAuthorize: false,
			isAuthorizing: false,
		} );
	} );

	test( 'should set isRedirectingToWpAdmin to true when an xmlrpc error occurs', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL,
		} );

		expect( state ).toEqual( { isRedirectingToWpAdmin: true } );
	} );

	test( 'should set isRedirectingToWpAdmin to true when a redirect to wp-admin is triggered', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_REDIRECT_WP_ADMIN,
		} );

		expect( state ).toEqual( { isRedirectingToWpAdmin: true } );
	} );

	test( 'should set clientNotResponding when a site request to current client fails', () => {
		const state = jetpackConnectAuthorize(
			{ clientId: 123 },
			{ type: SITE_REQUEST_FAILURE, siteId: 123 }
		);
		expect( state ).toMatchObject( { clientNotResponding: true } );
	} );

	test( 'should return the given state when a site request fails on a different site', () => {
		const originalState = { clientId: 123 };
		const state = jetpackConnectAuthorize( originalState, {
			type: SITE_REQUEST_FAILURE,
			siteId: 234,
		} );
		expect( state ).toEqual( originalState );
	} );

	test( "should return the given state when a site request fails and siteId doesn't match", () => {
		const originalState = { clientId: undefined };
		const state = jetpackConnectAuthorize( originalState, {
			type: SITE_REQUEST_FAILURE,
			siteId: 123,
		} );
		expect( state ).toEqual( originalState );
	} );

	test( 'should persist state when a site request to a different client fails', () => {
		const originalState = { clientId: 123, clientNotResponding: false };
		const state = jetpackConnectAuthorize( originalState, {
			type: SITE_REQUEST_FAILURE,
			siteId: 456,
		} );
		expect( state ).toEqual( originalState );
	} );

	test( 'should persist state', () => {
		const originalState = deepFreeze( {
			clientId: 1234,
			timestamp: Date.now(),
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: SERIALIZE,
		} );

		expect( state ).toEqual( originalState );
	} );

	test( 'should load valid persisted state', () => {
		const originalState = deepFreeze( {
			clientId: 1234,
			timestamp: Date.now(),
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: DESERIALIZE,
		} );

		expect( state ).toEqual( originalState );
	} );

	test( 'should not load stale state', () => {
		const originalState = deepFreeze( {
			clientId: 1234,
			timestamp: 1,
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: DESERIALIZE,
		} );

		expect( state ).toEqual( {} );
	} );

	test( 'should not auto-authorize by default', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_QUERY_SET,
		} );
		expect( state.autoAuthorize ).toEqual( false );
	} );

	test( 'should not auto-authorize non-Woo users', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_QUERY_SET,
			from: 'somewhere-else',
		} );
		expect( state.autoAuthorize ).toEqual( false );
	} );

	test( 'should auto-authorize Woo users', () => {
		const stateFromWooCommerceServicesPlugin = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_QUERY_SET,
			from: 'woocommerce-services-auto-authorize',
		} );
		expect( stateFromWooCommerceServicesPlugin.autoAuthorize ).toEqual( true );

		const stateFromWooCommerceWizard = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_QUERY_SET,
			from: 'woocommerce-setup-wizard',
		} );
		expect( stateFromWooCommerceWizard.autoAuthorize ).toEqual( true );
	} );
} );
