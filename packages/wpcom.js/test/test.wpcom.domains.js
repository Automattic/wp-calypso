/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */
const fixture = require( './fixture' );

describe( 'wpcom.domains', function () {
	// Global instances
	const wpcom = util.wpcom();
	const domains = wpcom.domains();

	describe( 'wpcom.domains.suggestions', function () {
		it( 'should request domains passing a string as query', () => {
			return new Promise( ( done ) => {
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

		it( 'should request domains passing an object as query', () => {
			return new Promise( ( done ) => {
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
	} );

	describe( 'wpcom.domains.suggestionsExamples', function () {
		it( 'should request domains using the example endpoint', () => {
			return new Promise( ( done ) => {
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
	} );

	describe( 'wpcom.domains.supportedStates', function () {
		it( 'should get localized list of supported states of Spain', () => {
			return new Promise( ( done ) => {
				domains
					.supportedStates( 'es' )
					.then( ( data ) => {
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.domains.supportedCountries', function () {
		it( 'should get localized list of supported countries', () => {
			return new Promise( ( done ) => {
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
} );
