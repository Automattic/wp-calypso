/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * me.connectedconnection
 */
describe( 'wpcom.me.publicizeConnection', function () {
	// Global instances
	var wpcom = util.wpcom();
	var me = wpcom.me();

	describe( 'wpcom.me.publicizeConnection.get', function () {
		it( "should get current user' publicize connections", function ( done ) {
			me.publicizeConnections( function ( err, data ) {
				if ( err ) throw err;

				assert.ok( data );
				assert.ok( data.connections );

				let connectionId =
					data.publicize_connections && data.publicize_connections[ 0 ]
						? data.publicize_connections[ 0 ].ID
						: null;

				if ( connectionId ) {
					describe( 'wpcom.me.publicizeConnection.get', function () {
						it( 'should get user publicize connection through of connection id', function ( done2 ) {
							me.publicizeConnection( connectionId ).get( function ( err2, data2 ) {
								if ( err2 ) throw err2;

								assert.ok( data2 );
								assert.equal( connectionId, data2.ID );
								done2();
							} );
						} );
					} );
				}
				done();
			} );
		} );
	} );
} );
