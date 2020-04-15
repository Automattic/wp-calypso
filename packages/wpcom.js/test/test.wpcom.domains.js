/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * Testing data
 */
var fixture = require( './fixture' );

describe( 'wpcom.domains', function () {
	// Global instances
	const wpcom = util.wpcom();
	const domains = wpcom.domains();

	describe( 'wpcom.domains.suggestions', function () {
		it( 'should request domains passing a string as query', ( done ) => {
			domains
				.suggestions( fixture.queryDomains.query )
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( 'number', typeof data.length );

					done();
				} )
				.catch( done );
		} );

		it( 'should request domains passing an object as query', ( done ) => {
			domains
				.suggestions( fixture.queryDomains )
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( 'number', typeof data.length );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.domains.suggestionsExamples', function () {
		it( 'should request domains using the example endpoint', ( done ) => {
			domains
				.suggestions( fixture.queryDomains.query )
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( 'number', typeof data.length );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.domains.supportedStates', function () {
		it( 'should get localized list of supported states of Spain', ( done ) => {
			domains
				.supportedStates( 'es' )
				.then( ( data ) => {
					assert.ok( data );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.domains.supportedCountries', function () {
		it( 'should get localized list of supported countries', ( done ) => {
			domains
				.supportedCountries()
				.then( ( data ) => {
					assert.ok( data );
					done();
				} )
				.catch( done );
		} );
	} );
} );
