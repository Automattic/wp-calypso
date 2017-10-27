/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
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
		expect( state ).to.eql( {} );
	} );

	test( 'should set isAuthorizing to true when starting authorization', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_AUTHORIZE,
		} );

		expect( state ).to.have.property( 'isAuthorizing' ).to.be.true;
		expect( state ).to.have.property( 'authorizeSuccess' ).to.be.false;
		expect( state ).to.have.property( 'authorizeError' ).to.be.false;
		expect( state ).to.have.property( 'isRedirectingToWpAdmin' ).to.be.false;
		expect( state ).to.have.property( 'autoAuthorize' ).to.be.false;
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

		expect( state ).to.not.have.property( 'userData' );
		expect( state ).to.not.have.property( 'bearerToken' );
	} );

	test( 'should set authorizeSuccess to true when completed authorization successfully', () => {
		const data = {
			plans_url: 'https://wordpress.com/jetpack/connect/plans/',
		};
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
			data,
		} );

		expect( state ).to.have.property( 'authorizeError' ).to.be.false;
		expect( state ).to.have.property( 'authorizeSuccess' ).to.be.true;
		expect( state ).to.have.property( 'autoAuthorize' ).to.be.false;
		expect( state )
			.to.have.property( 'plansUrl' )
			.to.eql( data.plans_url );
		expect( state ).to.have.property( 'siteReceived' ).to.be.false;
	} );

	test( 'should set authorizeSuccess to false when an error occurred during authorization', () => {
		const error = 'You need to stay logged in to your WordPress blog while you authorize Jetpack.';
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
			error,
		} );

		expect( state ).to.have.property( 'isAuthorizing' ).to.be.false;
		expect( state )
			.to.have.property( 'authorizeError' )
			.to.eql( error );
		expect( state ).to.have.property( 'authorizeSuccess' ).to.be.false;
		expect( state ).to.have.property( 'autoAuthorize' ).to.be.false;
	} );

	test( 'should set authorization code when login is completed', () => {
		const code = 'abcd1234efgh5678';
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
			data: {
				code,
			},
		} );

		expect( state )
			.to.have.property( 'authorizationCode' )
			.to.eql( code );
	} );

	test( 'should set siteReceived to true and omit some query object properties when received site list', () => {
		const state = jetpackConnectAuthorize(
			{
				queryObject: {
					_wp_nonce: 'testnonce',
					client_id: 'example.com',
					redirect_uri: 'https://example.com/',
					scope: 'auth',
					secret: 'abcd1234',
					site: 'https://example.com/',
					state: 1234567890,
				},
			},
			{
				type: JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
			}
		);

		expect( state ).to.have.property( 'siteReceived' ).to.be.true;
		expect( state ).to.have.property( 'isAuthorizing' ).to.be.false;
		expect( state )
			.to.have.property( 'queryObject' )
			.to.eql( {
				client_id: 'example.com',
				redirect_uri: 'https://example.com/',
				site: 'https://example.com/',
				state: 1234567890,
			} );
	} );

	test( 'should use default authorize state when setting an empty connect query', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_QUERY_SET,
		} );

		expect( state )
			.to.have.property( 'queryObject' )
			.to.eql( {} );
		expect( state ).to.have.property( 'isAuthorizing' ).to.be.false;
		expect( state ).to.have.property( 'authorizeSuccess' ).to.be.false;
		expect( state ).to.have.property( 'authorizeError' ).to.be.false;
	} );

	test( 'should use new query object over default authorize state when setting a connect query', () => {
		const queryObject = {
			redirect_uri: 'https://example.wordpress.com',
		};
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_QUERY_SET,
			queryObject,
		} );

		expect( state )
			.to.have.property( 'queryObject' )
			.to.eql( queryObject );
		expect( state ).to.have.property( 'isAuthorizing' ).to.be.false;
		expect( state ).to.have.property( 'authorizeSuccess' ).to.be.false;
		expect( state ).to.have.property( 'authorizeError' ).to.be.false;
	} );

	test( 'should set isAuthorizing and autoAuthorize to true when initiating an account creation', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_CREATE_ACCOUNT,
		} );

		expect( state ).to.have.property( 'isAuthorizing' ).to.be.true;
		expect( state ).to.have.property( 'authorizeSuccess' ).to.be.false;
		expect( state ).to.have.property( 'authorizeError' ).to.be.false;
		expect( state ).to.have.property( 'autoAuthorize' ).to.be.true;
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

		expect( state ).to.have.property( 'isAuthorizing' ).to.be.true;
		expect( state ).to.have.property( 'authorizeSuccess' ).to.be.false;
		expect( state ).to.have.property( 'authorizeError' ).to.be.false;
		expect( state ).to.have.property( 'autoAuthorize' ).to.be.true;
		expect( state )
			.to.have.property( 'userData' )
			.to.eql( userData );
		expect( state )
			.to.have.property( 'bearerToken' )
			.to.eql( bearer_token );
	} );

	test( 'should mark authorizeError as true on unsuccessful account creation', () => {
		const error = 'Sorry, that username already exists!';
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
			error,
		} );

		expect( state ).to.have.property( 'isAuthorizing' ).to.be.false;
		expect( state ).to.have.property( 'authorizeSuccess' ).to.be.false;
		expect( state ).to.have.property( 'authorizeError' ).to.be.true;
		expect( state ).to.have.property( 'autoAuthorize' ).to.be.false;
	} );

	test( 'should set isRedirectingToWpAdmin to true when an xmlrpc error occurs', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL,
		} );

		expect( state ).to.have.property( 'isRedirectingToWpAdmin' ).to.be.true;
	} );

	test( 'should set isRedirectingToWpAdmin to true when a redirect to wp-admin is triggered', () => {
		const state = jetpackConnectAuthorize( undefined, {
			type: JETPACK_CONNECT_REDIRECT_WP_ADMIN,
		} );

		expect( state ).to.have.property( 'isRedirectingToWpAdmin' ).to.be.true;
	} );

	test( 'should set clientNotResponding when a site request to current client fails', () => {
		const state = jetpackConnectAuthorize(
			{ queryObject: { client_id: '123' } },
			{ type: SITE_REQUEST_FAILURE, siteId: 123 }
		);
		expect( state ).to.have.property( 'clientNotResponding' ).to.be.true;
	} );

	test( 'should return the given state when a site request fails on a different site', () => {
		const originalState = { queryObject: { client_id: '123' } };
		const state = jetpackConnectAuthorize( originalState, {
			type: SITE_REQUEST_FAILURE,
			siteId: 234,
		} );
		expect( state ).to.eql( originalState );
	} );

	test( 'should return the given state when a site request fails and no client id is set', () => {
		const originalState = { queryObject: { jetpack_version: '4.0' } };
		const state = jetpackConnectAuthorize( originalState, {
			type: SITE_REQUEST_FAILURE,
			siteId: 123,
		} );
		expect( state ).to.eql( originalState );
	} );

	test( 'should return the given state when a site request fails and no query object is set', () => {
		const originalState = { isAuthorizing: false };
		const state = jetpackConnectAuthorize( originalState, {
			type: SITE_REQUEST_FAILURE,
			siteId: 123,
		} );
		expect( state ).to.eql( originalState );
	} );

	test( 'should persist state when a site request to a different client fails', () => {
		const state = jetpackConnectAuthorize(
			{ queryObject: { client_id: '123' } },
			{ type: SITE_REQUEST_FAILURE, siteId: 456 }
		);
		expect( state ).to.eql( { queryObject: { client_id: '123' } } );
	} );

	test( 'should persist state', () => {
		const originalState = deepFreeze( {
			queryObject: {
				client_id: 'example.com',
				redirect_uri: 'https://example.com/',
			},
			timestamp: Date.now(),
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: SERIALIZE,
		} );

		expect( state ).to.be.eql( originalState );
	} );

	test( 'should load valid persisted state', () => {
		const originalState = deepFreeze( {
			queryObject: {
				client_id: 'example.com',
				redirect_uri: 'https://example.com/',
			},
			timestamp: Date.now(),
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: DESERIALIZE,
		} );

		expect( state ).to.be.eql( originalState );
	} );

	test( 'should not load stale state', () => {
		const originalState = deepFreeze( {
			queryObject: {
				client_id: 'example.com',
				redirect_uri: 'https://example.com/',
			},
			timestamp: 1,
		} );
		const state = jetpackConnectAuthorize( originalState, {
			type: DESERIALIZE,
		} );

		expect( state ).to.be.eql( {} );
	} );
} );
