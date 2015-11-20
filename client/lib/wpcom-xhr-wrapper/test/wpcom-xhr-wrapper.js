/* eslint-disable valid-jsdoc */

/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var testError,
	testResponse;

function testRequest( params, callback ) {
	callback( testError, testResponse );
}

describe( 'wpcom-xhr-wrapper', function() {
	var xhr;

	before( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		mockery.registerMock( 'wpcom-xhr-request', testRequest );
		xhr = require( 'lib/wpcom-xhr-wrapper' );
	} );

	after( function() {
		mockery.deregisterMock( 'wpcom-xhr-request' );
	} );

	it( 'should still return a valid response', function( done ) {
		testError = false;
		testResponse = 'response';

		xhr( '/test', function( error, response ) {
			expect( error ).to.be.false;
			expect( response ).to.be.equals( 'response' );
			done();
		} );
	} );

	it( 'should return proxified error details', function( done ) {
		var response = {
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

		xhr( '/test', function( error ) {
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

		xhr( '/test', function( error ) {
			expect( error ).to.be.deep.equals( {
				error: testError.error,
				status: testError.status,
				response: testError.response
			} );

			done();
		} );
	} );
} );
