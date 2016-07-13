
/* eslint-disable valid-jsdoc */

/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'index', function() {
	let testError, testResponse, xhrErrorNormalizer;

	function testRequest( params, callback ) {
		callback( testError, testResponse );
	}

	const fakeWindow = {};

	useMockery();

	before( function() {
		mockery.registerMock( 'wpcom-xhr-request', testRequest );
		mockery.registerMock( 'window', fakeWindow );
		xhrErrorNormalizer = require( 'lib/wp/handlers/xhr-error-normalizer' ).xhrErrorNormalizer;
	} );

	it( 'should still return a valid response', function( done ) {
		testError = false;
		testResponse = 'response';

		xhrErrorNormalizer( '/test', function( error, response ) {
			expect( error ).to.be.false;
			expect( response ).to.be.equals( 'response' );
			done();
		} );
	} );

	it( 'should return proxified error details', function( done ) {
		const response = {
			body: {
				error: 'code',
				message: 'response text'
			}
		};

		testResponse = 'error';
		testError = {
			status: 400,
			message: 'http error',
			response: response
		};

		xhrErrorNormalizer( '/test', function( error ) {
			expect( error ).to.be.deep.equals( {
				message: response.body.message,
				error: response.body.error,
				statusCode: testError.status,
				status: testError.status,
				httpMessage: 'http error',
				response: response
			} );

			done();
		} );
	} );

	it( 'should handle invalid error details', function( done ) {
		testResponse = 'error';
		testError = {
			status: 400,
			error: 'http error',
			response: null
		};

		xhrErrorNormalizer( '/test', function( error ) {
			expect( error ).to.be.deep.equals( {
				error: testError.error,
				status: testError.status,
				response: testError.response
			} );

			done();
		} );
	} );
} );
