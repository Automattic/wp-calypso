/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */
const fixture = require( './fixture' );

/**
 * me.settings.profileLinks
 */
describe( 'wpcom.me.settings.profileLinks', function () {
	// Global instances
	const wpcom = util.wpcom();
	const me = wpcom.me();
	const settings = me.settings();
	const profile = settings.profileLinks();
	let testing_profile;
	let added_profile;

	// profile fixture
	const fix_profiles = fixture[ 'profile-links' ];

	// set random name ro first profile link
	const fix_profile = fix_profiles[ 0 ];
	const rnd = Math.random().toString().substr( 2 );
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
		it( 'should get at least one profile link for current user', function () {
			return new Promise( ( done ) => {
				profile.get( function ( err, data ) {
					if ( err ) throw err;

					assert.ok( data.profile_links instanceof Array );
					assert.ok( 1 <= data.profile_links.length );
					done();
				} );
			} );
		} );
	} );

	describe( 'wpcom.me.settings.profileLinks.add', function () {
		it( 'should not add link already added', function () {
			return new Promise( ( done ) => {
				profile.add( fix_profile, function ( err, data ) {
					if ( err ) throw err;

					assert.ok( ! data.added );
					assert.ok( data.duplicate instanceof Array );
					assert.ok( testing_profile.added[ 0 ].link_slug, data.duplicate[ 0 ].link_slug );
					done();
				} );
			} );
		} );

		it( 'should add a new profile link', function () {
			return new Promise( ( done ) => {
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
	} );

	describe( 'wpcom.me.settings.profileLinks.del', function () {
		it( 'should delete the new link already added', function () {
			return new Promise( ( done ) => {
				profile.del( added_profile.added[ 0 ].link_slug, function ( err, data ) {
					if ( err ) throw err;

					assert.ok( data.success );
					done();
				} );
			} );
		} );
	} );
} );
