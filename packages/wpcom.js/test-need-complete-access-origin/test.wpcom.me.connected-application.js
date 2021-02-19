/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * me.connectedApp
 */
describe( 'wpcom.me.connectedApp', function () {
	// Global instances
	const wpcom = util.wpcom();
	const me = wpcom.me();
	let appId;

	describe( 'wpcom.me.connectedApps', function () {
		it( "should get current user' connected applications", () => {
			return new Promise( ( done ) => {
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
	} );

	describe( 'wpcom.me.connectedApp.get', function () {
		if ( appId ) {
			it( "should get current user' connected applications", function () {
				return new Promise( ( done ) => {
					me.connectedApp( appId ).get( function ( err, data ) {
						if ( err ) throw err;

						assert.ok( data );
						assert.equal( appId, data.ID );
						done();
					} );
				} );
			} );
		}
	} );
} );
