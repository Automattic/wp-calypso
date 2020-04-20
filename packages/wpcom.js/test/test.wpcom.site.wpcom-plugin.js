/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * Testing data
 */
var fixture = require( './fixture' );

describe.skip( 'wpcom.site.wpcomPlugin', function () {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( fixture.site_business );

	// Create a testing_wpcomPlugin before to start tests
	var testingWPComPlugin;
	before( ( done ) => {
		site
			.wpcomPluginsList()
			.then( ( res ) => {
				var pluginId = res.plugins[ 0 ].slug;
				testingWPComPlugin = site.wpcomPlugin( pluginId );
				done();
			} )
			.catch( done );
	} );

	describe( 'wpcom.site.wpcomPlugin.activate', function () {
		it( 'should activate the wpcom plugin', ( done ) => {
			testingWPComPlugin
				.activate()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data instanceof Object, 'data is not an object' );
					assert.equal( data.active, true );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.wpcomPlugin.deactivate', function () {
		it( 'should deactivate the wpcom plugin', ( done ) => {
			testingWPComPlugin
				.deactivate()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data instanceof Object, 'data is not an object' );
					assert.equal( data.active, false );
					done();
				} )
				.catch( done );
		} );
	} );
} );
