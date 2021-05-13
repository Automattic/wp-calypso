/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */

describe( 'wpcom.domain', function () {
	// Global instances
	const wpcom = util.wpcom();

	describe( 'wpcom.domain.status', function () {
		it( 'should get the domain status', () => {
			return new Promise( ( done ) => {
				wpcom
					.domain( 'dd32.me' )
					.status()
					.then( ( data ) => {
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.domain.isAvailable', function () {
		it( 'should check that wordpress.com is not available', () => {
			return new Promise( ( done ) => {
				wpcom
					.domain( 'wordpress.com' )
					.isAvailable()
					.then( ( data ) => {
						console.log( `-> data -> `, data );

						assert.ok( data );
						assert.equal( false, data.is_available );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.domain.isMappable', function () {
		it( 'should check that wordpress.com is not mappable', () => {
			return new Promise( ( done ) => {
				wpcom
					.domain( 'wordpress.com' )
					.isMappable()
					.then( done )
					.catch( ( error ) => {
						assert.ok( error );
						done();
					} );
			} );
		} );
	} );

	describe( 'wpcom.domain.canRedirect', function () {
		it( 'should check if wordpress.com can be redirected', () => {
			return new Promise( ( done ) => {
				wpcom
					.domain( 'retrofocs.wordpress.com' )
					.canRedirect( 'retrofox.me' )
					.then( done )
					.catch( ( error ) => {
						assert.ok( error );
						done();
					} );
			} );
		} );
	} );

	describe( 'wpcom.domain.emailForwards', function () {
		it( 'should get email forwards/configuration', () => {
			return new Promise( ( done ) => {
				wpcom
					.domain( 'retrofox.me' )
					.emailForwards()
					.then( ( data ) => {
						assert.ok( data );
						assert.equal( 'number', typeof data.max_forwards );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.domain.nameserversList', function () {
		it( 'should get a list of nameservers', () => {
			return new Promise( ( done ) => {
				wpcom
					.domain( 'retrofox.me' )
					.nameserversList()
					.then( ( data ) => {
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.domain.dns', function () {
		it( 'should get a list of dns records', () => {
			return new Promise( ( done ) => {
				wpcom
					.domain( 'wordpress.com' )
					.dnsList()
					.then( ( data ) => {
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.domain.googleApps', function () {
		it( 'should get a list of google app accounts', () => {
			return new Promise( ( done ) => {
				wpcom
					.domain( 'wordpress.com' )
					.googleAppsList()
					.then( ( data ) => {
						assert.ok( data );
						done();
					} )
					.catch( done );
			} );
		} );
	} );
} );
