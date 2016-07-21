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
	let testError, testResponse, xhr;
	const testHeaders = {
		Date: 'Fri, 21 Aug 2015 02:48:06 GMT',
		'Content-Type': 'application/json'
	};

	function testRequest( params, callback ) {
		callback( testError, testResponse, testHeaders );
	}

	useMockery();

	before( function() {
		mockery.registerMock( 'wpcom-xhr-request', testRequest );
		xhr = require( 'lib/wpcom-xhr-wrapper' );
	} );

	it( 'should still return a valid response', function( done ) {
		testError = false;
		testResponse = 'response';

		xhr( '/test', function( error, response, headers ) {
			expect( error ).to.be.false;
			expect( response ).to.be.equals( 'response' );
			expect( headers ).to.be.ok;
			done();
		} );
	} );

	it( 'should return proxified error details', function( done ) {
		const response = {
			body: {
				error: 'code',
				message: 'response text'
			},
			headers: {
				Date: 'Fri, 21 Aug 2015 02:48:06 GMT',
				'Content-Type': 'application/json'
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
