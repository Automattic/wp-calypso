/**
 * @format
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import * as actions from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
	JETPACK_CONNECT_DISMISS_URL_STATUS,
	JETPACK_CONNECT_AUTHORIZE,
	JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
	JETPACK_CONNECT_RETRY_AUTH,
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	JETPACK_CONNECT_SSO_VALIDATION_ERROR,
	SITE_RECEIVE,
} from 'state/action-types';

jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );

describe( 'actions', () => {
	const mySitesPath = '/rest/v1.1/me/sites';

	describe( '#confirmJetpackInstallStatus()', () => {
		test( 'should dispatch confirm status action when called', () => {
			const { confirmJetpackInstallStatus } = actions;
			const jetpackStatus = true;

			expect( confirmJetpackInstallStatus( jetpackStatus ) ).toEqual( {
				type: JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
				status: jetpackStatus,
			} );
		} );
	} );

	describe( '#dismissUrl()', () => {
		test( 'should dispatch dismiss url status action when called', () => {
			const { dismissUrl } = actions;
			const url = 'http://example.com';

			expect( dismissUrl( url ) ).toEqual( {
				type: JETPACK_CONNECT_DISMISS_URL_STATUS,
				url: url,
			} );
		} );
	} );

	describe( '#retryAuth()', () => {
		test( 'should dispatch redirect action when called', () => {
			const spy = jest.fn();
			const { retryAuth } = actions;
			const url = 'http://example.com';

			retryAuth( url, 0 )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: JETPACK_CONNECT_RETRY_AUTH,
				slug: 'example.com',
				attemptNumber: 0,
			} );
		} );
	} );

	describe( '#authorize()', () => {
		const queryObject = {
			_wp_nonce: 'nonce',
			client_id: '12345678',
			redirect_uri: 'https://example.com/',
			scope: 'auth',
			secret: '1234abcd',
			state: 12345678,
		};
		const code = 'abcdefghi1234';
		const { _wp_nonce, client_id, redirect_uri, scope, secret, state } = queryObject;

		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + client_id + '/jetpack-login' )
					.query( {
						_wp_nonce,
						redirect_uri,
						scope,
						state,
					} )
					.reply(
						200,
						{
							code,
						},
						{
							'Content-Type': 'application/json',
						}
					);

				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + client_id + '/authorize', {
						code,
						state,
						redirect_uri,
						secret,
					} )
					.reply(
						200,
						{
							result: 'connected',
							plans_url: '/plans/example.com',
						},
						{
							'Content-Type': 'application/json',
						}
					);

				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.filteringPath( () => mySitesPath )
					.get( mySitesPath )
					.reply(
						200,
						{
							ID: client_id,
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch authorize request action when thunk triggered', () => {
				const spy = jest.fn();
				const { authorize } = actions;

				authorize( queryObject )( spy );

				expect( spy ).toHaveBeenCalledWith( {
					type: JETPACK_CONNECT_AUTHORIZE,
					queryObject,
				} );
			} );

			test( 'should dispatch login complete action when request completes', () => {
				const spy = jest.fn();
				const { authorize } = actions;

				return authorize( queryObject )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: JETPACK_CONNECT_AUTHORIZE_LOGIN_COMPLETE,
						data: {
							code: 'abcdefghi1234',
						},
					} );
				} );
			} );

			test( 'should dispatch authorize receive action when request completes', () => {
				const spy = jest.fn();
				const { authorize } = actions;

				return authorize( queryObject )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
						siteId: client_id,
						data: {
							result: 'connected',
							plans_url: '/plans/example.com',
						},
						error: null,
					} );
				} );
			} );

			test( 'should dispatch sites receive action when request completes', () => {
				const spy = jest.fn();
				const { authorize } = actions;

				return authorize( queryObject )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: SITE_RECEIVE,
						site: { ID: client_id },
					} );
				} );
			} );

			test( 'should dispatch authorize receive site list action when request completes', () => {
				const spy = jest.fn();
				const { authorize } = actions;

				return authorize( queryObject )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: JETPACK_CONNECT_AUTHORIZE_RECEIVE_SITE_LIST,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.1/jetpack-blogs/' + client_id + '/jetpack-login' )
					.query( {
						_wp_nonce,
						redirect_uri,
						scope,
						state,
					} )
					.reply(
						400,
						{
							error: 'not_verified',
							message: 'Could not verify your request.',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch authorize receive action when request completes', () => {
				const spy = jest.fn();
				const { authorize } = actions;

				return authorize( queryObject )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						type: JETPACK_CONNECT_AUTHORIZE_RECEIVE,
						siteId: client_id,
						data: null,
						error: {
							error: 'not_verified',
							message: 'Could not verify your request.',
							status: 400,
						},
					} );
				} );
			} );
		} );
	} );

	describe( '#validateSSONonce()', () => {
		const siteId = '123456';
		const ssoNonce = '123456789';
		const blogDetails = {
			domain: 'example.wordpress.com',
			title: 'My BBQ Site',
			icon: {
				img: '',
				ico: '',
			},
			URL: 'https://example.wordpress.com',
			is_vip: false,
			admin_url: 'https://example.wordpress.com/wp-admin',
		};

		const sharedDetails = {
			ID: 0,
			login: 'bbquser',
			email: 'ieatbbq@example.wordpress.com',
			url: 'https://example.wordpress.com',
			first_name: 'Lou',
			last_name: 'Bucket',
			display_name: 'bestbbqtester',
			description: 'I like BBQ, a lot.',
			two_step_enabled: 0,
			external_user_id: 1,
		};

		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-validate', {
						sso_nonce: ssoNonce,
					} )
					.reply(
						200,
						{
							success: true,
							blog_details: blogDetails,
							shared_details: sharedDetails,
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch validate action when thunk triggered', () => {
				const spy = jest.fn();
				const { validateSSONonce } = actions;

				validateSSONonce( siteId, ssoNonce )( spy );
				expect( spy ).toHaveBeenCalledWith( {
					siteId: siteId,
					type: JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
				} );
			} );

			test( 'should dispatch receive action when request completes', () => {
				const spy = jest.fn();
				const { validateSSONonce } = actions;

				return validateSSONonce( siteId, ssoNonce )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						success: true,
						blogDetails: blogDetails,
						sharedDetails: sharedDetails,
						type: JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-validate', {
						sso_nonce: ssoNonce,
					} )
					.reply(
						400,
						{
							error: 'invalid_input',
							message: 'sso_nonce is a required parameter for this endpoint',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch receive action when request completes', () => {
				const spy = jest.fn();
				const { validateSSONonce } = actions;

				return validateSSONonce( siteId, ssoNonce )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						error: {
							error: 'invalid_input',
							message: 'sso_nonce is a required parameter for this endpoint',
							status: 400,
						},
						type: JETPACK_CONNECT_SSO_VALIDATION_ERROR,
					} );
				} );
			} );
		} );
	} );

	describe( '#authorizeSSO()', () => {
		const siteId = '123456';
		const ssoNonce = '123456789';
		const ssoUrl = 'http://example.wordpress.com';

		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-authorize', {
						sso_nonce: ssoNonce,
					} )
					.reply(
						200,
						{
							sso_url: ssoUrl,
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch validate action when thunk triggered', () => {
				const spy = jest.fn();
				const { authorizeSSO } = actions;

				authorizeSSO( siteId, ssoNonce, ssoUrl )( spy );
				expect( spy ).toHaveBeenCalledWith( {
					siteId: siteId,
					type: JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
				} );
			} );

			test( 'should dispatch receive action when request completes', () => {
				const spy = jest.fn();
				const { authorizeSSO } = actions;

				return authorizeSSO( siteId, ssoNonce, ssoUrl )( spy ).then( () => {
					expect( spy ).toHaveBeenCalledWith( {
						ssoUrl,
						siteUrl: ssoUrl,
						type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-authorize', {
						sso_nonce: ssoNonce,
					} )
					.reply(
						400,
						{
							error: 'invalid_input',
							message: 'sso_nonce is a required parameter for this endpoint',
						},
						{
							'Content-Type': 'application/json',
						}
					);
			} );

			test( 'should dispatch receive action when request completes', () => {
				const spy = jest.fn();
				const { authorizeSSO } = actions;

				return authorizeSSO( siteId, ssoNonce, ssoUrl )( spy ).then( () => {
					expect( spy ).toHaveBeenLastCalledWith( {
						error: {
							error: 'invalid_input',
							message: 'sso_nonce is a required parameter for this endpoint',
							status: 400,
						},
						type: JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
					} );
				} );
			} );
		} );
	} );
} );
