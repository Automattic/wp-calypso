/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * me.connectedApp
 */
describe( 'wpcom.me.connectedApp', function () {
	// Global instances
	var wpcom = util.wpcom();
	var me = wpcom.me();
	var appId;

	describe( 'wpcom.me.connectedApps', function () {
		it( "should get current user' connected applications", ( done ) => {
			me.connectedApps()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.connected_applications instanceof Array );
					done();

					appId =
						data.connected_applications && data.connected_applications[ 0 ]
							? data.connected_applications[ 0 ].ID
							: null;
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.me.connectedApp.get', function () {
		if ( appId ) {
			it( "should get current user' connected applications", function ( done ) {
				me.connectedApp( appId ).get( function ( err, data ) {
					if ( err ) throw err;

					assert.ok( data );
					assert.equal( appId, data.ID );
					done();
				} );
			} );
		}
	} );
} );
