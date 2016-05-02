/**
 * External dependencies
 */
import { expect } from 'chai';
import nock from 'nock';

/**
 * Internal dependencies
 */
import {
	JETPACK_CONNECT_SSO_VALIDATE,
	JETPACK_CONNECT_SSO_VALIDATION_RECEIVE,
	JETPACK_CONNECT_SSO_AUTHORIZE,
	JETPACK_CONNECT_SSO_AUTHORIZATION_RECEIVE
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

	before( function() {
		actions = require( '../actions' );
	} );

	describe( '#validateSSONonce()', () => {
		const siteId = '123456';
		const ssoNonce = '123456789';

		describe( 'success', () => {
			beforeEach( () => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/jetpack-blogs/' + siteId + '/sso-validate', {
						sso_nonce: ssoNonce
					} )
					.reply( 200, {
						_headers: {
							'Content-Type': 'application/json'
						},
						success: true
					} );
			} );

			afterEach( () => {
				nock.cleanAll();
			} );

			it( 'should dispatch validate action when thunk triggered', () => {
				const { validateSSONonce } = actions;

				validateSSONonce( siteId, ssoNonce )( spy );
				expect( spy ).to.have.been.calledWith( {
					siteId: siteId,
					type: JETPACK_CONNECT_SSO_VALIDATE
				} );
			} );

			it( 'should dispatch receive action when request completes', () => {
				const { validateSSONonce } = actions;

				return validateSSONonce( siteId, ssoNonce )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						error: false,
						success: true,
						type: JETPACK_CONNECT_SSO_VALIDATION_RECEIVE
					} );
				} );
			} );
		} );

		describe( 'failure', () => {
			beforeEach( () => {
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

			afterEach( () => {
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
						success: false,
						type: JETPACK_CONNECT_SSO_VALIDATION_RECEIVE
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

				authorizeSSO( siteId, ssoNonce )( spy );
				expect( spy ).to.have.been.calledWith( {
					siteId: siteId,
					type: JETPACK_CONNECT_SSO_AUTHORIZE
				} );
			} );

			it( 'should dispatch receive action when request completes', () => {
				const { authorizeSSO } = actions;

				return authorizeSSO( siteId, ssoNonce )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						error: false,
						ssoUrl,
						type: JETPACK_CONNECT_SSO_AUTHORIZATION_RECEIVE
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

				return authorizeSSO( siteId, ssoNonce )( spy ).then( () => {
					expect( spy ).to.have.been.calledWith( {
						error: {
							error: 'invalid_input',
							message: 'sso_nonce is a required parameter for this endpoint',
							status: 400
						},
						ssoUrl: false,
						type: JETPACK_CONNECT_SSO_AUTHORIZATION_RECEIVE
					} );
				} );
			} );
		} );
	} );
} );
