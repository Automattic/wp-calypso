/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "localRequest.*.expect"] }] */

/**
 * External dependencies
 */
import request from 'superagent';
import supertest from 'supertest';
import unmodifiedConfig from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import { useSandbox } from 'calypso/test-helpers/use-sinon';

describe( 'api', () => {
	let app;
	let config;
	let localRequest;
	let sandbox;

	useSandbox( ( newSandbox ) => ( sandbox = newSandbox ) );

	beforeAll( () => {
		config = require( '@automattic/calypso-config' );
		sandbox.stub( config, 'isEnabled' ).withArgs( 'oauth' ).returns( true );
		app = require( '../' ).default();
		localRequest = supertest( app );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	test( 'should return package version', () => {
		const version = require( '../../../package.json' ).version;

		return localRequest.get( '/version' ).then( ( { body, status } ) => {
			expect( status ).toBe( 200 );
			expect( body ).toEqual( { version } );
		} );
	} );

	test( 'should clear oauth cookie and redirect to login_url', () => {
		return localRequest
			.get( '/logout' )
			.redirects( 0 )
			.set( 'cookie', 'wpcom_token=test' )
			.then( ( { header, status } ) => {
				expect( status ).toBe( 302 );
				expect( header.location ).toBe( config( 'login_url' ) );
				expect( header[ 'set-cookie' ] ).toEqual( [
					'wpcom_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
				] );
			} );
	} );

	if ( unmodifiedConfig( 'env_id' ) === 'desktop' ) {
		test( 'should handle incomplete login details', function () {
			return new Promise( ( done ) => {
				const end = sandbox.stub( request.Request.prototype, 'end' );

				end.callsArgWithAsync( 0, { status: 400 }, { body: { error: 'invalid_request' } } );

				localRequest.post( '/oauth' ).end( function ( err, res ) {
					expect( res.body.error ).toBe( 'invalid_request' );
					expect( res.status ).toBe( 400 );
					done();
				} );
			} );
		} );

		/* eslint-disable-next-line jest/expect-expect */
		test( 'should return a login error with a bad login', function () {
			return new Promise( ( done ) => {
				const end = sandbox.stub( request.Request.prototype, 'end' );
				const response = { error: 'invalid_request' };

				end.callsArgWithAsync( 0, { status: 400 }, { body: response } );

				localRequest
					.post( '/oauth' )
					.send( { username: 'testoauth', password: 'test' } )
					.expect( 400, response, done );
			} );
		} );

		/* eslint-disable-next-line jest/expect-expect */
		test( 'should return a 400 needs_2fa if the user has 2FA enabled', function () {
			return new Promise( ( done ) => {
				const response = {
					error: 'needs_2fa',
					error_description:
						'Please enter the verification code generated by your authenticator app.',
				};
				const end = sandbox.stub( request.Request.prototype, 'end' );

				end.callsArgWithAsync( 0, { status: 400 }, { body: response } );

				localRequest
					.post( '/oauth' )
					.send( { username: 'validuser', password: 'validpassword' } )
					.expect( 400, response, done );
			} );
		} );

		/* eslint-disable-next-line jest/expect-expect */
		test( 'should return a successful login', function () {
			return new Promise( ( done ) => {
				const response = { access_token: '1234' };
				const end = sandbox.stub( request.Request.prototype, 'end' );

				end.callsArgWithAsync( 0, null, { body: response } );

				localRequest
					.post( '/oauth' )
					.send( { username: 'validuser', password: 'validpassword', auth_code: '123456' } )
					.expect( 200, response, done );
			} );
		} );

		/* eslint-disable-next-line jest/expect-expect */
		test( 'should return a 408 with no connection', function () {
			return new Promise( ( done ) => {
				const response = {
					error: 'invalid_request',
					error_description:
						'The request to localhost failed (code 12345), please check your internet connection and try again.',
				};
				const end = sandbox.stub( request.Request.prototype, 'end' );

				end.callsArgWithAsync( 0, { host: 'localhost', code: '12345' }, undefined );

				localRequest
					.post( '/oauth' )
					.send( { username: 'validuser', password: 'validpassword' } )
					.expect( 408, response, done );
			} );
		} );
	}
} );
