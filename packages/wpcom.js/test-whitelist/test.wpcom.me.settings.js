/**
 * Module dependencies
 */
var ProfileLinks = require( '../lib/me.settings.profile-links' );
var util = require( './util' );
var assert = require( 'assert' );

/**
 * me.settings
 */
describe( 'wpcom.me.settings', function () {
	// Global instances
	var wpcom = util.wpcom();
	var me = wpcom.me();
	var settings = me.settings();

	describe( 'wpcom.me.settings.get', function () {
		it( 'should get settings for current user', function ( done ) {
			settings.get( function ( err, data ) {
				if ( err ) throw err;

				assert.ok( data );
				done();
			} );
		} );
	} );

	describe( 'wpcom.me.settings.profileLinks', function () {
		it( 'should create a ProfileLinks instance', function () {
			var profileLinks = settings.profileLinks();
			assert.ok( profileLinks instanceof ProfileLinks );
		} );
	} );
} );
