/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */
const fixture = require( './fixture' );

describe( 'wpcom.site.media', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	let add_urls_array;
	let add_urls_object;

	// Create a testing_media before to start tests

	let testing_media;
	before( ( done ) => {
		site
			.addMediaFiles( fixture.media.files[ 1 ] )
			.then( ( data ) => {
				testing_media = data ? data.media[ 0 ] : {};
				done();
			} )
			.catch( done );
	} );

	after( ( done ) => {
		if ( ! add_urls_array || add_urls_array.length < 1 ) {
			return done();
		}

		// clean media added through of array by urls
		site
			.deleteMedia( add_urls_array.media[ 0 ].ID )
			.then( () => site.deleteMedia( add_urls_array.media[ 1 ].ID ) )
			.then( () => site.deleteMedia( add_urls_array.media[ 2 ].ID ) )
			.then( () => site.deleteMedia( add_urls_object.media[ 0 ].ID ) )
			.then( () => done() )
			.catch( done );
	} );

	describe( 'wpcom.site.media.get', function () {
		it( 'should get added media', ( done ) => {
			const media = site.media( testing_media.ID );
			media
				.get()
				.then( ( data ) => {
					assert.equal( testing_media.ID, data.ID );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.media.update', function () {
		it( 'should edit the media title', ( done ) => {
			const edited_title = 'This is the new title';

			site
				.media( testing_media.ID )
				.update( { apiVersion: '1.1' }, { title: edited_title } )
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( edited_title, data.title );

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.media.addFiles', function () {
		it( 'should create a new media from a file', ( done ) => {
			site
				.media()
				.addFiles( fixture.media.files )
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.media instanceof Array );
					assert.equal( fixture.media.files.length, data.media.length );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.media.addUrls', function () {
		it( 'should create a new media from an object', ( done ) => {
			const media_object = fixture.media.urls[ 1 ];

			site
				.media()
				.addUrls( media_object )
				.then( ( data ) => {
					assert.ok( data );
					add_urls_object = data;
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.media.addUrls', function () {
		it( 'should create a new media', ( done ) => {
			site
				.media()
				.addUrls( fixture.media.urls )
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data.media instanceof Array );
					assert.equal( fixture.media.urls.length, data.media.length );

					add_urls_array = data;

					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.media.delete', function () {
		it( 'should delete a media', ( done ) => {
			site
				.media( testing_media.ID )
				.del()
				.then( ( data ) => {
					assert.equal( testing_media.ID, data.ID );
					done();
				} )
				.catch( done );
		} );
	} );
} );
