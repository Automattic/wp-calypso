/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import jetpackConnectAuthorize from '../jetpack-connect-authorize.js';
import {
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_QUERY_SET,
} from 'state/jetpack-connect/action-types';
import { DESERIALIZE, SERIALIZE, SITE_REQUEST_FAILURE } from 'state/action-types';

import { useSandbox } from 'test/helpers/use-sinon';

describe( '#jetpackConnectAuthorize()', () => {
	useSandbox( ( sandbox ) => {
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
		} );
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
		const timestamp = 1410647400000;
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_QUERY_SET,
			clientId,
			timestamp,
		} );

		expect( state ).toMatchObject( {
			clientId,
			authorizeError: false,
			authorizeSuccess: false,
			isAuthorizing: false,
			timestamp,
		} );
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
			timestamp: 1410647400000,
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: SERIALIZE,
		} );

		expect( state ).toEqual( originalState );
	} );

	test( 'should load valid persisted state', () => {
		const originalState = deepFreeze( {
			clientId: 1234,
			timestamp: Infinity, // Ensure timestamp is not expired
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: DESERIALIZE,
		} );

		expect( state ).toEqual( originalState );
	} );

	test( 'should not load stale state', () => {
		const originalState = deepFreeze( {
			clientId: 1234,
			timestamp: -Infinity, // Ensure timestamp is expired
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: DESERIALIZE,
		} );

		expect( state ).toEqual( {} );
	} );
} );
