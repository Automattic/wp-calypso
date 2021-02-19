/**
 * Module dependencies
 */
const ProfileLinks = require( '../lib/me.settings.profile-links' );
const util = require( './util' );
const assert = require( 'assert' );

/**
 * me.settings
 */
describe( 'wpcom.me.settings', function () {
	// Global instances
	const wpcom = util.wpcom();
	const me = wpcom.me();
	const settings = me.settings();

	describe( 'wpcom.me.settings.get', function () {
		it( 'should get settings for current user', function () {
			return new Promise( ( done ) => {
				settings.get( function ( err, data ) {
					if ( err ) throw err;

					assert.ok( data );
					done();
				} );
			} );
		} );
	} );

	describe( 'wpcom.me.settings.profileLinks', function () {
		it( 'should create a ProfileLinks instance', function () {
			const profileLinks = settings.profileLinks();
			assert.ok( profileLinks instanceof ProfileLinks );
		} );
	} );
} );
