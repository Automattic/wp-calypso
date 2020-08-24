/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * Testing data
 */
var fixture = require( './fixture' );

/**
 * me.settings.profileLinks
 */
describe( 'wpcom.me.settings.profileLinks', function () {
	// Global instances
	var wpcom = util.wpcom();
	var me = wpcom.me();
	var settings = me.settings();
	var profile = settings.profileLinks();
	var testing_profile;
	var added_profile;

	// profile fixture
	var fix_profiles = fixture[ 'profile-links' ];

	// set random name ro first profile link
	var fix_profile = fix_profiles[ 0 ];
	var rnd = Math.random().toString().substr( 2 );
	fix_profile.title += '-' + rnd;
	fix_profile.value += '/#' + rnd;

	// Create a testing_profile_link before
	before( function ( done ) {
		profile.add( fix_profile, function ( err, data_profile ) {
			if ( err ) throw err;

			testing_profile = data_profile;
			done();
		} );
	} );

	after( function ( done ) {
		// delete testing_profile
		profile.del( testing_profile.added[ 0 ].link_slug, done );
	} );

	describe( 'wpcom.me.settings.profileLinks.get', function () {
		it( 'should get at least one profile link for current user', function ( done ) {
			profile.get( function ( err, data ) {
				if ( err ) throw err;

				assert.ok( data.profile_links instanceof Array );
				assert.ok( 1 <= data.profile_links.length );
				done();
			} );
		} );
	} );

	describe( 'wpcom.me.settings.profileLinks.add', function () {
		it( 'should not add link already added', function ( done ) {
			profile.add( fix_profile, function ( err, data ) {
				if ( err ) throw err;

				assert.ok( ! data.added );
				assert.ok( data.duplicate instanceof Array );
				assert.ok( testing_profile.added[ 0 ].link_slug, data.duplicate[ 0 ].link_slug );
				done();
			} );
		} );

		it( 'should add a new profile link', function ( done ) {
			fix_profile.title += '-new';
			fix_profile.value += '-new';

			profile.add( fix_profile, function ( err, data ) {
				if ( err ) throw err;

				assert.ok( ! data.duplicate );
				assert.ok( data.added instanceof Array );
				assert.ok( 1 === data.added.length );
				assert.ok( fix_profile.title === data.added[ 0 ].title );

				// store data in global var
				added_profile = data;
				done();
			} );
		} );
	} );

	describe( 'wpcom.me.settings.profileLinks.del', function () {
		it( 'should delete the new link already added', function ( done ) {
			profile.del( added_profile.added[ 0 ].link_slug, function ( err, data ) {
				if ( err ) throw err;

				assert.ok( data.success );
				done();
			} );
		} );
	} );
} );
