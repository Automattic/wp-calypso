/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */

import { useSandbox } from 'test/helpers/use-sinon';
import {
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	JETPACK_CONNECT_SSO_VALIDATION_ERROR,
	JETPACK_CONNECT_CHECK_URL,
	JETPACK_CONNECT_CHECK_URL_RECEIVE,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_REDIRECT,
	JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_ACTIVATE_MANAGE,
	JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
	JETPACK_CONNECT_QUERY_SET,
	JETPACK_CONNECT_QUERY_UPDATE,
	JETPACK_CONNECT_CREATE_ACCOUNT,
	JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
	JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL,
	JETPACK_CONNECT_REDIRECT_WP_ADMIN,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

import reducer, {
	jetpackConnectAuthorize,
	jetpackSSO,
	jetpackSSOSessions,
	jetpackConnectSessions,
	jetpackConnectSite
} from '../reducer';

const successfulSSOValidation = {
	type: JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	success: true,
	blogDetails: {
		domain: 'example.wordpress.com',
		title: 'My BBQ Site',
		icon: {
			img: '',
			ico: '',
		},
		URL: 'https://example.wordpress.com',
		admin_url: 'https://example.wordpress.com/wp-admin'
	},
	sharedDetails: {
		ID: 0,
		login: 'bbquser',
		email: 'ieatbbq@example.wordpress.com',
		url: 'https://example.wordpress.com',
		first_name: 'Lou',
		last_name: 'Bucket',
		display_name: 'bestbbqtester',
		description: 'I like BBQ, a lot.',
		two_step_enabled: 0,
		external_user_id: 1
	}
};

const falseSSOValidation = Object.assign( successfulSSOValidation, { success: false } );

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'jetpackConnectSite',
			'jetpackConnectAuthorize',
			'jetpackConnectSessions',
			'jetpackSSO',
			'jetpackSSOSessions'
		] );
	} );

	describe( '#jetpackConnectSessions()', () => {
		it( 'should default to an empty object', () => {
			const state = jetpackConnectSessions( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should add the url slug as a new property when checking a new url', () => {
			const state = jetpackConnectSessions( undefined, {
				type: JETPACK_CONNECT_CHECK_URL,
				url: 'https://example.wordpress.com'
			} );

			expect( state ).to.have.property( 'example.wordpress.com' ).to.be.a( 'object' );
		} );

		it( 'should store a timestamp when checking a new url', () => {
			const nowTime = ( new Date() ).getTime();
			const state = jetpackConnectSessions( undefined, {
				type: JETPACK_CONNECT_CHECK_URL,
				url: 'https://example.wordpress.com'
			} );

			expect( state[ 'example.wordpress.com' ] ).to.have.property( 'timestamp' )
				.to.be.at.least( nowTime );
		} );

		it( 'should update the timestamp when checking an existent url', () => {
			const nowTime = ( new Date() ).getTime();
			const state = jetpackConnectSessions( { 'example.wordpress.com': { timestamp: 1 } }, {
				type: JETPACK_CONNECT_CHECK_URL,
				url: 'https://example.wordpress.com'
			} );

			expect( state[ 'example.wordpress.com' ] ).to.have.property( 'timestamp' )
				.to.be.at.least( nowTime );
		} );

		it( 'should not restore a state with a property without a timestamp', () => {
			const state = jetpackConnectSessions( { 'example.wordpress.com': {} }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should not restore a state with a property with a non-integer timestamp', () => {
			const state = jetpackConnectSessions( { 'example.wordpress.com': { timestamp: '1' } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should not restore a state with a property with a stale timestamp', () => {
			const state = jetpackConnectSessions( { 'example.wordpress.com': { timestamp: 1 } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should not restore a state with a session stored with extra properties', () => {
			const timestamp = Date.now();
			const state = jetpackConnectSessions( { 'example.wordpress.com': { timestamp, foo: 'bar' } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should restore a valid state', () => {
			const timestamp = Date.now();
			const state = jetpackConnectSessions( { 'example.wordpress.com': { timestamp } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( { 'example.wordpress.com': { timestamp } } );
		} );

		it( 'should restore a valid state including dashes, slashes and semicolons', () => {
			const timestamp = Date.now();
			const state = jetpackConnectSessions( { 'https://example.wordpress.com:3000/test-one': { timestamp } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( { 'https://example.wordpress.com:3000/test-one': { timestamp } } );
		} );

		it( 'should restore only sites with non-stale timestamps', () => {
			const timestamp = Date.now();
			const state = jetpackConnectSessions( {
				'example.wordpress.com': { timestamp: 1 },
				'automattic.wordpress.com': { timestamp },
			}, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( { 'automattic.wordpress.com': { timestamp } } );
		} );
	} );

	describe( '#jetpackConnectSite()', () => {
		it( 'should default to an empty object', () => {
			const state = jetpackConnectSite( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should add the url and mark it as currently fetching', () => {
			const state = jetpackConnectSite( undefined, {
				type: JETPACK_CONNECT_CHECK_URL,
				url: 'https://example.wordpress.com'
			} );

			expect( state ).to.have.property( 'url' )
				.to.eql( 'https://example.wordpress.com' );
			expect( state ).to.have.property( 'isFetching' )
				.to.be.true;
			expect( state ).to.have.property( 'isFetched' )
				.to.be.false;
			expect( state ).to.have.property( 'isDismissed' )
				.to.be.false;
			expect( state ).to.have.property( 'installConfirmedByUser' )
				.to.be.null;
			expect( state ).to.have.property( 'data' )
				.to.eql( {} );
		} );

		it( 'should mark the url as fetched if it is the current one', () => {
			const data = {
				exists: true,
				isWordPress: true,
				hasJetpack: true,
				isJetpackActive: true,
				isWordPressDotCom: false
			};
			const state = jetpackConnectSite( { url: 'https://example.wordpress.com' }, {
				type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
				url: 'https://example.wordpress.com',
				data: data
			} );

			expect( state ).to.have.property( 'isFetching' )
				.to.be.false;
			expect( state ).to.have.property( 'isFetched' )
				.to.be.true;
			expect( state ).to.have.property( 'data' )
				.to.eql( data );
		} );

		it( 'should not mark the url as fetched if it is not the current one', () => {
			const data = {
				exists: true,
				isWordPress: true,
				hasJetpack: true,
				isJetpackActive: true,
				isWordPressDotCom: false
			};
			const state = jetpackConnectSite( { url: 'https://automattic.com' }, {
				type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
				url: 'https://example.wordpress.com',
				data: data
			} );

			expect( state ).to.eql( { url: 'https://automattic.com' } );
		} );

		it( 'should mark the url as dismissed if it is the current one', () => {
			const state = jetpackConnectSite( { url: 'https://example.wordpress.com' }, {
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: 'https://example.wordpress.com'
			} );

			expect( state ).to.have.property( 'installConfirmedByUser' )
				.to.be.null;
			expect( state ).to.have.property( 'isDismissed' )
				.to.be.true;
		} );

		it( 'should not mark the url as dismissed if it is not the current one', () => {
			const state = jetpackConnectSite( { url: 'https://automattic.com' }, {
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: 'https://example.wordpress.com'
			} );

			expect( state ).to.eql( { url: 'https://automattic.com' } );
		} );

		it( 'should schedule a redirect to the url if it is the current one', () => {
			const state = jetpackConnectSite( { url: 'https://example.wordpress.com' }, {
				type: JETPACK_CONNECT_REDIRECT,
				url: 'https://example.wordpress.com'
			} );

			expect( state ).to.have.property( 'isRedirecting' )
				.to.be.true;
		} );

		it( 'should not schedule a redirect to the url if it is not the current one', () => {
			const state = jetpackConnectSite( { url: 'https://automattic.com' }, {
				type: JETPACK_CONNECT_REDIRECT,
				url: 'https://example.wordpress.com'
			} );

			expect( state ).to.eql( { url: 'https://automattic.com' } );
		} );

		it( 'should set the jetpack confirmed status to the new one', () => {
			const state = jetpackConnectSite( { url: 'https://example.wordpress.com' }, {
				type: JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
				status: true
			} );

			expect( state ).to.have.property( 'installConfirmedByUser' )
				.to.be.true;
		} );

		it( 'should not persist state', () => {
			const originalState = deepFreeze( {
				url: 'https://example.wordpress.com'
			} );
			const state = jetpackConnectSite( originalState, {
				type: SERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const originalState = deepFreeze( {
				url: 'https://example.wordpress.com'
			} );
			const state = jetpackConnectSite( originalState, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );
	} );

	describe( '#jetpackSSOSessions()', () => {
		it( 'should default to an empty object', () => {
			const state = jetpackSSOSessions( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should store an integer timestamp when creating new session', () => {
			const nowTime = ( new Date() ).getTime();
			const state = jetpackSSOSessions( undefined, {
				type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
				ssoUrl: 'https://example.wordpress.com?action=jetpack-sso&result=success&sso_nonce={$nonce}&user_id={$user_id}',
				siteUrl: 'https://example.wordpress.com'
			} );

			expect( state ).to.have.property( 'example.wordpress.com' )
				.to.be.a( 'object' );
			expect( state[ 'example.wordpress.com' ] ).to.have.property( 'timestamp' )
				.to.be.at.least( nowTime );
		} );

		it( 'should persist state', () => {
			const originalState = deepFreeze( {
				ssoUrl: 'https://example.wordpress.com?action=jetpack-sso&result=success&sso_nonce={$nonce}&user_id={$user_id}',
				siteUrl: 'https://example.wordpress.com'
			} );
			const state = jetpackSSOSessions( originalState, {
				type: SERIALIZE
			} );

			expect( state ).to.be.eql( originalState );
		} );

		it( 'should load valid persisted state', () => {
			const originalState = deepFreeze( {
				ssoUrl: 'https://example.wordpress.com?action=jetpack-sso&result=success&sso_nonce={$nonce}&user_id={$user_id}',
				siteUrl: 'https://example.wordpress.com'
			} );
			const state = jetpackSSOSessions( originalState, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( originalState );
		} );
	} );

	describe( '#jetpackConnectAuthorize()', () => {
		it( 'should default to an empty object', () => {
			const state = jetpackConnectAuthorize( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should set isAuthorizing to true when starting authorization', () => {
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_AUTHORIZE
			} );

			expect( state ).to.have.property( 'isAuthorizing' )
				.to.be.true;
			expect( state ).to.have.property( 'authorizeSuccess' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeError' )
				.to.be.false;
			expect( state ).to.have.property( 'isRedirectingToWpAdmin' )
				.to.be.false;
			expect( state ).to.have.property( 'autoAuthorize' )
				.to.be.false;
		} );

		it( 'should omit userData and bearerToken when starting authorization', () => {
			const state = jetpackConnectAuthorize( {
				userData: {
					ID: 123,
					email: 'example@example.com'
				},
				bearerToken: 'abcd1234'
			}, {
				type: JETPACK_CONNECT_AUTHORIZE
			} );

			expect( state ).to.not.have.property( 'userData' );
			expect( state ).to.not.have.property( 'bearerToken' );
		} );

		it( 'should set authorizeSuccess to true when completed authorization successfully', () => {
			const data = {
				plans_url: 'https://wordpress.com/jetpack/connect/plans/',
				activate_manage: 'abcdefghi12345678'
			};
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
				data
			} );

			expect( state ).to.have.property( 'authorizeError' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeSuccess' )
				.to.be.true;
			expect( state ).to.have.property( 'autoAuthorize' )
				.to.be.false;
			expect( state ).to.have.property( 'plansUrl' )
				.to.eql( data.plans_url );
			expect( state ).to.have.property( 'siteReceived' )
				.to.be.false;
			expect( state ).to.have.property( 'activateManageSecret' )
				.to.eql( data.activate_manage );
		} );

		it( 'should set authorizeSuccess to false when an error occurred during authorization', () => {
			const error = 'You need to stay logged in to your WordPress blog while you authorize Jetpack.';
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
				error
			} );

			expect( state ).to.have.property( 'isAuthorizing' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeError' )
				.to.eql( error );
			expect( state ).to.have.property( 'authorizeSuccess' )
				.to.be.false;
			expect( state ).to.have.property( 'autoAuthorize' )
				.to.be.false;
		} );

		it( 'should set authorization code when login is completed', () => {
			const code = 'abcd1234efgh5678';
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
				data: {
					code
				}
			} );

			expect( state ).to.have.property( 'authorizationCode' )
				.to.eql( code );
		} );

		it( 'should set siteReceived to true and omit some query object properties when received site list', () => {
			const state = jetpackConnectAuthorize( {
				queryObject: {
					_wp_nonce: 'testnonce',
					client_id: 'example.com',
					redirect_uri: 'https://example.com/',
					scope: 'auth',
					secret: 'abcd1234',
					site: 'https://example.com/',
					state: 1234567890
				}
			}, {
				type: JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST
			} );

			expect( state ).to.have.property( 'siteReceived' )
				.to.be.true;
			expect( state ).to.have.property( 'isAuthorizing' )
				.to.be.false;
			expect( state ).to.have.property( 'queryObject' )
				.to.eql( {
					client_id: 'example.com',
					redirect_uri: 'https://example.com/',
					site: 'https://example.com/',
					state: 1234567890
				} );
		} );

		it( 'should set isActivating to true when manage is being activated', () => {
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_ACTIVATE_MANAGE
			} );

			expect( state ).to.have.property( 'isActivating' )
				.to.be.true;
		} );

		it( 'should mark manage as activated when request completes', () => {
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
				data: {
					result: true
				}
			} );

			expect( state ).to.have.property( 'isActivating' )
				.to.be.false;
			expect( state ).to.have.property( 'manageActivated' )
				.to.be.true;
			expect( state ).to.have.property( 'manageActivatedError' )
				.to.be.undefined;
			expect( state ).to.have.property( 'activateManageSecret' )
				.to.be.false;
		} );

		it( 'should store the error if an error occurs during manage activation', () => {
			const error = 'There was an error while activating the module.';
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_ACTIVATE_MANAGE_RECEIVE,
				error
			} );

			expect( state ).to.have.property( 'isActivating' )
				.to.be.false;
			expect( state ).to.have.property( 'manageActivated' )
				.to.be.true;
			expect( state ).to.have.property( 'manageActivatedError' )
				.to.eql( error );
			expect( state ).to.have.property( 'activateManageSecret' )
				.to.be.false;
		} );

		it( 'should use default authorize state when setting an empty connect query', () => {
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_QUERY_SET
			} );

			expect( state ).to.have.property( 'queryObject' )
				.to.eql( {} );
			expect( state ).to.have.property( 'isAuthorizing' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeSuccess' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeError' )
				.to.be.false;
		} );

		it( 'should use new query object over default authorize state when setting a connect query', () => {
			const queryObject = {
				redirect_uri: 'https://example.wordpress.com'
			};
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_QUERY_SET,
				queryObject
			} );

			expect( state ).to.have.property( 'queryObject' )
				.to.eql( queryObject );
			expect( state ).to.have.property( 'isAuthorizing' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeSuccess' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeError' )
				.to.be.false;
		} );

		it( 'should update only the specified query object property when updating a connect query', () => {
			const state = jetpackConnectAuthorize( {
				queryObject: {
					client_id: 'example.com',
					redirect_uri: 'https://example.com/',
				}
			}, {
				type: JETPACK_CONNECT_QUERY_UPDATE,
				property: 'redirect_uri',
				value: 'https://automattic.com/'
			} );

			expect( state ).to.have.property( 'queryObject' )
				.to.eql( {
					client_id: 'example.com',
					redirect_uri: 'https://automattic.com/'
				} );
		} );

		it( 'should set isAuthorizing and autoAuthorize to true when initiating an account creation', () => {
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_CREATE_ACCOUNT
			} );

			expect( state ).to.have.property( 'isAuthorizing' )
				.to.be.true;
			expect( state ).to.have.property( 'authorizeSuccess' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeError' )
				.to.be.false;
			expect( state ).to.have.property( 'autoAuthorize' )
				.to.be.true;
		} );

		it( 'should receive userData and bearerToken on successful account creation', () => {
			const userData = {
				ID: 123,
				email: 'example@example.com'
			};
			const bearer_token = 'abcd1234';
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
				userData,
				data: {
					bearer_token
				}
			} );

			expect( state ).to.have.property( 'isAuthorizing' )
				.to.be.true;
			expect( state ).to.have.property( 'authorizeSuccess' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeError' )
				.to.be.false;
			expect( state ).to.have.property( 'autoAuthorize' )
				.to.be.true;
			expect( state ).to.have.property( 'userData' )
				.to.eql( userData );
			expect( state ).to.have.property( 'bearerToken' )
				.to.eql( bearer_token );
		} );

		it( 'should mark authorizeError as true on unsuccessful account creation', () => {
			const error = 'Sorry, that username already exists!';
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_CREATE_ACCOUNT_RECEIVE,
				error
			} );

			expect( state ).to.have.property( 'isAuthorizing' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeSuccess' )
				.to.be.false;
			expect( state ).to.have.property( 'authorizeError' )
				.to.be.true;
			expect( state ).to.have.property( 'autoAuthorize' )
				.to.be.false;
		} );

		it( 'should set isRedirectingToWpAdmin to true when an xmlrpc error occurs', () => {
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_REDIRECT_XMLRPC_ERROR_FALLBACK_URL
			} );

			expect( state ).to.have.property( 'isRedirectingToWpAdmin' )
				.to.be.true;
		} );

		it( 'should set isRedirectingToWpAdmin to true when a redirect to wp-admin is triggered', () => {
			const state = jetpackConnectAuthorize( undefined, {
				type: JETPACK_CONNECT_REDIRECT_WP_ADMIN
			} );

			expect( state ).to.have.property( 'isRedirectingToWpAdmin' )
				.to.be.true;
		} );

		it( 'should persist state', () => {
			const originalState = deepFreeze( {
				queryObject: {
					client_id: 'example.com',
					redirect_uri: 'https://example.com/',
				}
			} );
			const state = jetpackConnectAuthorize( originalState, {
				type: SERIALIZE
			} );

			expect( state ).to.be.eql( originalState );
		} );

		it( 'should load valid persisted state', () => {
			const originalState = deepFreeze( {
				queryObject: {
					client_id: 'example.com',
					redirect_uri: 'https://example.com/',
				}
			} );
			const state = jetpackConnectAuthorize( originalState, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( originalState );
		} );
	} );

	describe( '#jetpackSSO()', () => {
		it( 'should default to an empty object', () => {
			const state = jetpackSSO( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should not persist state', () => {
			const original = deepFreeze( {
				isAuthorizing: false,
				site_id: 0,
				authorizationError: false,
				ssoUrl: 'http://example.wordpress.com'
			} );

			const state = jetpackSSO( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should set isValidating to true when validating', () => {
			const state = jetpackSSO( undefined, {
				type: JETPACK_CONNECT_SSO_VALIDATION_REQUEST
			} );

			expect( state ).to.have.property( 'isValidating', true );
		} );

		it( 'should set isAuthorizing to true when authorizing', () => {
			const state = jetpackSSO( undefined, {
				type: JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST
			} );

			expect( state ).to.have.property( 'isAuthorizing', true );
		} );

		it( 'should set isValidating to false after validation', () => {
			const actions = [
				successfulSSOValidation,
				{
					type: JETPACK_CONNECT_SSO_VALIDATION_ERROR,
					error: {
						statusCode: 400
					}
				}
			];

			actions.forEach( ( action ) => {
				const state = jetpackSSO( undefined, action );
				expect( state ).to.have.property( 'isValidating', false );
			} );
		} );

		it( 'should store boolean nonceValid after validation', () => {
			const actions = [
				successfulSSOValidation,
				falseSSOValidation
			];

			actions.forEach( ( action ) => {
				const originalAction = deepFreeze( action );
				const state = jetpackSSO( undefined, originalAction );
				expect( state ).to.have.property( 'nonceValid', originalAction.success );
			} );
		} );

		it( 'should store blog details after validation', () => {
			const successState = jetpackSSO( undefined, successfulSSOValidation );
			expect( successState ).to.have.property( 'blogDetails' )
				.to.be.eql( successfulSSOValidation.blogDetails );
		} );

		it( 'should store shared details after validation', () => {
			const successState = jetpackSSO( undefined, successfulSSOValidation );
			expect( successState ).to.have.property( 'sharedDetails' )
				.to.be.eql( successfulSSOValidation.sharedDetails );
		} );

		it( 'should set isAuthorizing to false after authorization', () => {
			const actions = [
				{
					type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
					ssoUrl: 'http://example.wordpress.com',
					siteUrl: 'http://example.wordpress.com'
				},
				{
					type: JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
					error: {
						statusCode: 400
					},
				}
			];

			actions.forEach( ( action ) => {
				const state = jetpackSSO( undefined, action );
				expect( state ).to.have.property( 'isAuthorizing', false );
			} );
		} );

		it( 'should store sso_url after authorization', () => {
			const action = deepFreeze( {
				type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
				ssoUrl: 'http://example.wordpress.com',
				siteUrl: 'http://example.wordpress.com'
			} );

			const state = jetpackSSO( undefined, action );

			expect( state ).to.have.property( 'ssoUrl', action.ssoUrl );
		} );

		it( 'should not persist state', () => {
			const originalState = deepFreeze( {
				ssoUrl: 'http://example.wordpress.com',
				siteUrl: 'http://example.wordpress.com'
			} );
			const state = jetpackSSO( originalState, {
				type: SERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const originalState = deepFreeze( {
				ssoUrl: 'http://example.wordpress.com',
				siteUrl: 'http://example.wordpress.com'
			} );
			const state = jetpackSSO( originalState, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );
	} );
} );
