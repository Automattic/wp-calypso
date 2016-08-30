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
		domain: 'website.com',
		title: 'My BBQ Site',
		icon: {
			img: '',
			ico: '',
		},
		URL: 'https://website.com',
		admin_url: 'https://website.com/wp-admin'
	},
	sharedDetails: {
		ID: 0,
		login: 'bbquser',
		email: 'ieatbbq@website.com',
		url: 'https://website.com',
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
				url: 'https://website.com'
			} );

			expect( state ).to.have.property( 'website.com' ).to.be.a( 'object' );
		} );

		it( 'should store a timestamp when checking a new url', () => {
			const nowTime = ( new Date() ).getTime();
			const state = jetpackConnectSessions( undefined, {
				type: JETPACK_CONNECT_CHECK_URL,
				url: 'https://website.com'
			} );

			expect( state[ 'website.com' ] ).to.have.property( 'timestamp' )
				.to.be.at.least( nowTime );
		} );

		it( 'should update the timestamp when checking an existent url', () => {
			const nowTime = ( new Date() ).getTime();
			const state = jetpackConnectSessions( { 'website.com': { timestamp: 1 } }, {
				type: JETPACK_CONNECT_CHECK_URL,
				url: 'https://website.com'
			} );

			expect( state[ 'website.com' ] ).to.have.property( 'timestamp' )
				.to.be.at.least( nowTime );
		} );

		it( 'should not restore a state with a property without a timestamp', () => {
			const state = jetpackConnectSessions( { 'website.com': {} }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should not restore a state with a property with a non-integer timestamp', () => {
			const state = jetpackConnectSessions( { 'website.com': { timestamp: '1' } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should not restore a state with a session stored with extra properties', () => {
			const state = jetpackConnectSessions( { 'website.com': { timestamp: 1, foo: 'bar' } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should restore a valid state', () => {
			const state = jetpackConnectSessions( { 'website.com': { timestamp: 1 } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( { 'website.com': { timestamp: 1 } } );
		} );

		it( 'should restore a valid state including dashes, slashes and semicolons', () => {
			const state = jetpackConnectSessions( { 'https://website.com:3000/test-one': { timestamp: 1 } }, {
				type: DESERIALIZE
			} );

			expect( state ).to.be.eql( { 'https://website.com:3000/test-one': { timestamp: 1 } } );
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
				url: 'https://website.com'
			} );

			expect( state ).to.have.property( 'url' )
				.to.eql( 'https://website.com' );
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
			const state = jetpackConnectSite( { url: 'https://website.com' }, {
				type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
				url: 'https://website.com',
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
			const state = jetpackConnectSite( { url: 'https://anotherwebsite.com' }, {
				type: JETPACK_CONNECT_CHECK_URL_RECEIVE,
				url: 'https://website.com',
				data: data
			} );

			expect( state ).to.eql( { url: 'https://anotherwebsite.com' } );
		} );

		it( 'should mark the url as dismissed if it is the current one', () => {
			const state = jetpackConnectSite( { url: 'https://website.com' }, {
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: 'https://website.com'
			} );

			expect( state ).to.have.property( 'installConfirmedByUser' )
				.to.be.null;
			expect( state ).to.have.property( 'isDismissed' )
				.to.be.true;
		} );

		it( 'should not mark the url as dismissed if it is not the current one', () => {
			const state = jetpackConnectSite( { url: 'https://anotherwebsite.com' }, {
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: 'https://website.com'
			} );

			expect( state ).to.eql( { url: 'https://anotherwebsite.com' } );
		} );

		it( 'should schedule a redirect to the url if it is the current one', () => {
			const state = jetpackConnectSite( { url: 'https://website.com' }, {
				type: JETPACK_CONNECT_REDIRECT,
				url: 'https://website.com'
			} );

			expect( state ).to.have.property( 'isRedirecting' )
				.to.be.true;
		} );

		it( 'should not schedule a redirect to the url if it is not the current one', () => {
			const state = jetpackConnectSite( { url: 'https://anotherwebsite.com' }, {
				type: JETPACK_CONNECT_REDIRECT,
				url: 'https://website.com'
			} );

			expect( state ).to.eql( { url: 'https://anotherwebsite.com' } );
		} );

		it( 'should set the jetpack confirmed status to the new one', () => {
			const state = jetpackConnectSite( { url: 'https://website.com' }, {
				type: JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
				status: true
			} );

			expect( state ).to.have.property( 'installConfirmedByUser' )
				.to.be.true;
		} );

		it( 'should not persist state', () => {
			const originalState = deepFreeze( {
				url: 'https://website.com'
			} );
			const state = jetpackConnectSite( originalState, {
				type: SERIALIZE
			} );

			expect( state ).to.be.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const originalState = deepFreeze( {
				url: 'https://website.com'
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
				ssoUrl: 'https://website.com?action=jetpack-sso&result=success&sso_nonce={$nonce}&user_id={$user_id}',
				siteUrl: 'https://website.com'
			} );

			expect( state ).to.have.property( 'website.com' )
				.to.be.a( 'object' );
			expect( state[ 'website.com' ] ).to.have.property( 'timestamp' )
				.to.be.at.least( nowTime );
		} );
	} );

	describe( '#jetpackConnectAuthorize()', () => {
		it( 'should default to an empty object', () => {
			const state = jetpackConnectAuthorize( undefined, {} );
			expect( state ).to.eql( {} );
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
				ssoUrl: 'http://website.com'
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
					ssoUrl: 'http://website.com',
					siteUrl: 'http://website.com'
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
				ssoUrl: 'http://website.com',
				siteUrl: 'http://website.com'
			} );

			const state = jetpackSSO( undefined, action );

			expect( state ).to.have.property( 'ssoUrl', action.ssoUrl );
		} );
	} );
} );
