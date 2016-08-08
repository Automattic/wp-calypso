/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST,
	JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS,
	JETPACK_CONNECT_SSO_AUTHORIZE_ERROR,
	JETPACK_CONNECT_SSO_VALIDATION_REQUEST,
	JETPACK_CONNECT_SSO_VALIDATION_SUCCESS,
	JETPACK_CONNECT_SSO_VALIDATION_ERROR,
} from 'state/action-types';

import useFakeDom from 'test/helpers/use-fake-dom';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let actions, sandbox, spy;

	useFakeDom();

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		spy = sandbox.spy();
	} );

	beforeEach( function() {
		actions = require( '../actions' );
	} );

	describe( '#validateSSONonce()', () => {
		const siteId = '123456';
		const ssoNonce = '123456789';
		const blogDetails = {
			domain: 'website.com',
			title: 'My BBQ Site',
			icon: {
				img: '',
				ico: '',
			},
			URL: 'https://website.com',
			is_vip: false,
			admin_url: 'https://website.com/wp-admin'
		};

		const sharedDetails = {
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
		};

		describe( 'success', () => {
			before( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-validate', {
						sso_nonce: ssoNonce
					} )
					.reply( 200, {
						_headers: {
							'Content-Type': 'application/json'
						},
						success: true,
						blog_details: blogDetails,
						shared_details: sharedDetails
					} );
			} );

			after( () => {
				nock.cleanAll();
			} );

			it( 'should dispatch validate action when thunk triggered', () => {
				const { validateSSONonce } = actions;

				validateSSONonce( siteId, ssoNonce )( spy );
				expect( spy ).to.have.been.calledWith( {
					siteId: siteId,
					type: JETPACK_CONNECT_SSO_VALIDATION_REQUEST
				} );
			} );

			it( 'should dispatch receive action when request completes', () => {
				const { validateSSONonce } = actions;

				return validateSSONonce( siteId, ssoNonce )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						success: true,
						blogDetails: blogDetails,
						sharedDetails: sharedDetails,
						type: JETPACK_CONNECT_SSO_VALIDATION_SUCCESS
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			before( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-validate', {
						sso_nonce: ssoNonce
					} )
					.reply( 400, {
						_headers: {
							'Content-Type': 'application/json'
						},
						error: 'invalid_input',
						message: 'sso_nonce is a required parameter for this endpoint'
					} );
			} );

			after( () => {
				nock.cleanAll();
			} );

			it( 'should dispatch receive action when request completes', () => {
				const { validateSSONonce } = actions;

				return validateSSONonce( siteId, ssoNonce )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						error: {
							error: 'invalid_input',
							message: 'sso_nonce is a required parameter for this endpoint',
							status: 400
						},
						type: JETPACK_CONNECT_SSO_VALIDATION_ERROR
					} );
				} );
			} );
		} );
	} );

	describe( '#authorizeSSO()', () => {
		const siteId = '123456';
		const ssoNonce = '123456789';
		const ssoUrl = 'http://website.com';

		describe( 'success', () => {
			before( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-authorize', {
						sso_nonce: ssoNonce
					} )
					.reply( 200, {
						_headers: {
							'Content-Type': 'application/json'
						},
						sso_url: ssoUrl
					} );
			} );

			after( () => {
				nock.cleanAll();
			} );

			it( 'should dispatch validate action when thunk triggered', () => {
				const { authorizeSSO } = actions;

				authorizeSSO( siteId, ssoNonce, ssoUrl )( spy );
				expect( spy ).to.have.been.calledWith( {
					siteId: siteId,
					type: JETPACK_CONNECT_SSO_AUTHORIZE_REQUEST
				} );
			} );

			it( 'should dispatch receive action when request completes', () => {
				const { authorizeSSO } = actions;

				return authorizeSSO( siteId, ssoNonce, ssoUrl )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						ssoUrl,
						siteUrl: ssoUrl,
						type: JETPACK_CONNECT_SSO_AUTHORIZE_SUCCESS
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			before( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-authorize', {
						sso_nonce: ssoNonce
					} )
					.reply( 400, {
						_headers: {
							'Content-Type': 'application/json'
						},
						error: 'invalid_input',
						message: 'sso_nonce is a required parameter for this endpoint'
					} );
			} );

			after( () => {
				nock.cleanAll();
			} );

			it( 'should dispatch receive action when request completes', () => {
				const { authorizeSSO } = actions;

				return authorizeSSO( siteId, ssoNonce, ssoUrl )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						error: {
							error: 'invalid_input',
							message: 'sso_nonce is a required parameter for this endpoint',
							status: 400
						},
						type: JETPACK_CONNECT_SSO_AUTHORIZE_ERROR
					} );
				} );
			} );
		} );
	} );
} );
