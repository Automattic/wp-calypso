/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	map = require( 'lodash/map' ),
	useFakeDom = require( 'test/helpers/use-fake-dom' );

/**
 * Internal dependencies
 */
var JetpackSite = require( 'lib/site/jetpack' ),
	MediaUtils = require( '../utils' );

describe( 'MediaUtils', function() {
	useFakeDom();

	describe( '#url()', function() {
		var media;

		beforeEach( function() {
			media = {
				URL: 'https://secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6',
				thumbnails: {
					thumbnail: 'https://secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6?s=150'
				}
			};
		} );

		it( 'should simply return the URL if media is transient', function() {
			var url;

			media.transient = true;

			url = MediaUtils.url( media, {
				maxWidth: 450
			} );

			expect( url ).to.equal( media.URL );
		} );

		it( 'should accept a media object without options, returning the URL', function() {
			var url = MediaUtils.url( media );

			expect( url ).to.equal( media.URL );
		} );

		it( 'should accept a photon option to use the photon service', function() {
			var url = MediaUtils.url( media, {
				photon: true
			} );

			expect( url ).to.equal( 'https://i2.wp.com/secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6?ssl=1' );
		} );

		it( 'should generate the correct width-constrained photon URL', function() {
			var url = MediaUtils.url( media, {
				photon: true,
				maxWidth: 450
			} );

			expect( url ).to.equal( 'https://i2.wp.com/secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6?ssl=1&w=450' );
		} );

		it( 'should generate the correct width-constrained URL', function() {
			var url = MediaUtils.url( media, {
				maxWidth: 450
			} );

			expect( url ).to.equal( 'https://secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6?w=450' );
		} );

		it( 'should attempt to find and return a desired thumbnail size', function() {
			var url = MediaUtils.url( media, {
				size: 'thumbnail'
			} );

			expect( url ).to.equal( media.thumbnails.thumbnail );
		} );

		it( 'should gracefully handle empty media objects', function() {
			var url = MediaUtils.url( {}, {
				size: 'thumbnail',
				maxWidth: 450
			} );

			expect( url ).to.be.undefined;
		} );
	} );

	describe( '#getFileExtension()', function() {
		it( 'should return undefined for a falsey media value', function() {
			expect( MediaUtils.getFileExtension() ).to.be.undefined;
		} );

		it( 'should detect extension from file name', function() {
			expect( MediaUtils.getFileExtension( 'example.gif' ) ).to.equal( 'gif' );
		} );

		it( 'should handle reserved url characters in filename', function() {
			expect( MediaUtils.getFileExtension( 'example#?#?.gif' ) ).to.equal( 'gif' );
		} );

		it( 'should detect extension from HTML5 File object', function() {
			expect( MediaUtils.getFileExtension( new window.File( [''], 'example.gif' ) ) ).to.equal( 'gif' );
		} );

		it( 'should detect extension from HTML5 File object with reserved url chars', function() {
			expect( MediaUtils.getFileExtension( new window.File( [''], 'example#?#?.gif' ) ) ).to.equal( 'gif' );
		} );

		it( 'should detect extension from object file property', function() {
			expect( MediaUtils.getFileExtension( { file: 'example.gif' } ) ).to.equal( 'gif' );
		} );

		it( 'should detect extension from already computed extension property', function() {
			expect( MediaUtils.getFileExtension( { extension: 'gif' } ) ).to.equal( 'gif' );
		} );

		it( 'should detect extension from object URL property', function() {
			expect( MediaUtils.getFileExtension( { URL: 'example.gif' } ) ).to.equal( 'gif' );
		} );

		it( 'should detect extension from object guid property', function() {
			expect( MediaUtils.getFileExtension( { guid: 'example.gif' } ) ).to.equal( 'gif' );
		} );

		it( 'should detect extension from URL string with query parameters', function() {
			expect( MediaUtils.getFileExtension( 'https://example.com/example.gif?w=110' ) ).to.equal( 'gif' );
		} );
	} );

	describe( '#getMimePrefix()', function() {
		it( 'should return undefined if a mime type can\'t be determined', function() {
			expect( MediaUtils.getMimePrefix() ).to.be.undefined;
		} );

		it( 'should return the mime prefix if a mime type can be determined', function() {
			expect( MediaUtils.getMimePrefix( 'example.png' ) ).to.be.equal( 'image' );
		} );
	} );

	describe( '#getMimeType()', function() {
		it( 'should return undefined for a falsey media value', function() {
			expect( MediaUtils.getMimeType() ).to.be.undefined;
		} );

		it( 'should return undefined if detected extension doesn\'t exist in mime_types', function() {
			expect( MediaUtils.getMimeType( 'file.badextension' ) ).to.be.undefined;
		} );

		it( 'should return an object mime type', function() {
			expect( MediaUtils.getMimeType( { mime_type: 'application/fake' } ) ).to.equal( 'application/fake' );
		} );

		it( 'should detect mime type from string extension', function() {
			expect( MediaUtils.getMimeType( 'example.gif' ) ).to.equal( 'image/gif' );
		} );

		it( 'should detect mime type with reserved url characters in filename', function() {
			expect( MediaUtils.getMimeType( 'example#?#?.gif' ) ).to.equal( 'image/gif' );
		} );

		it( 'should ignore invalid filenames', function() {
			expect( MediaUtils.getMimeType( 'example#?#?.gif?w=100' ) ).to.be.undefined;
		} );

		it( 'should detect mime type from HTML5 File object', function() {
			expect( MediaUtils.getMimeType( new window.File( [ '' ], 'example.gif', { type: 'image/gif' } ) ) ).to.equal( 'image/gif' );
		} );

		it( 'should detect mime type from object file property', function() {
			expect( MediaUtils.getMimeType( { file: 'example.gif' } ) ).to.equal( 'image/gif' );
		} );

		it( 'should detect mime type from object URL property', function() {
			expect( MediaUtils.getMimeType( { URL: 'example.gif' } ) ).to.equal( 'image/gif' );
		} );

		it( 'should ignore query string parameters', function() {
			expect( MediaUtils.getMimeType( { URL: 'example.gif?w=110' } ) ).to.equal( 'image/gif' );
		} );

		it( 'should ignore query string parameters in URL strings', function() {
			expect( MediaUtils.getMimeType( 'https://example.com/example.gif?w=110' ) ).to.equal( 'image/gif' );
		} );

		it( 'should detect mime type from object guid property', function() {
			expect( MediaUtils.getMimeType( { guid: 'example.gif' } ) ).to.equal( 'image/gif' );
		} );

		it( 'should detect mime type regardless of extension case', function() {
			expect( MediaUtils.getMimeType( 'example.GIF' ) ).to.equal( 'image/gif' );
		} );
	} );

	describe( '#filterItemsByMimePrefix()', function() {
		it( 'should return an array filtered to the matching mime prefix', function() {
			var items = [
				{ ID: 100, mime_type: 'image/jpg' },
				{ ID: 200, mime_type: 'video/mp4' }
			];

			expect( MediaUtils.filterItemsByMimePrefix( items, 'image' ) ).to.eql( [ items[ 0 ] ] );
		} );

		it( 'should gracefully omit items where a mime type could not be determined', function() {
			var items = [
				{ ID: 100, mime_type: 'image/jpg' },
				{ ID: 200 },
				undefined
			];

			expect( MediaUtils.filterItemsByMimePrefix( items, 'image' ) ).to.eql( [ items[ 0 ] ] );
		} );
	} );

	describe( '#sortItemsByDate()', function() {
		var items;

		beforeEach( function() {
			items = [
				{ ID: 1, date: '2015-06-19T09:36:09-04:00' },
				{ ID: 2, date: '2015-06-19T11:36:09-04:00' }
			];
		} );

		it( 'should return a new array array, sorted descending by date', function() {
			expect( map( MediaUtils.sortItemsByDate( items ), 'ID' ) ).to.eql( [ 2, 1 ] );
		} );

		it( 'should return the item with the the greater ID if the dates are not set', function() {
			items = items.map( function( item ) {
				item.date = null;
				return item;
			} );

			expect( map( MediaUtils.sortItemsByDate( items ), 'ID' ) ).to.eql( [ 2, 1 ] );
		} );

		it( 'should return the item with the the greater ID if the dates are equal', function() {
			items = items.map( function( item ) {
				item.date = '2015-06-19T09:36:09-04:00';
				return item;
			} );

			expect( map( MediaUtils.sortItemsByDate( items ), 'ID' ) ).to.eql( [ 2, 1 ] );
		} );

		it( 'should parse dates in string format', function() {
			items = items.map( function( item ) {
				item.date = item.date.toString();
				return item;
			} );

			expect( map( MediaUtils.sortItemsByDate( items ), 'ID' ) ).to.eql( [ 2, 1 ] );
		} );

		it( 'should not mutate the original array', function() {
			MediaUtils.sortItemsByDate( items );
			expect( map( items, 'ID' ) ).to.eql( [ 1, 2 ] );
		} );
	} );

	describe( '#isSiteAllowedFileTypesToBeTrusted()', function() {
		it( 'should return false for versions of Jetpack where option is not synced', function() {
			var site = new JetpackSite( {
				jetpack: true,
				options: {
					jetpack_version: '3.8.0'
				}
			} );

			expect( MediaUtils.isSiteAllowedFileTypesToBeTrusted( site ) ).to.be.false;
		} );

		it( 'should return true for versions of Jetpack where option is synced', function() {
			var site = new JetpackSite( {
				jetpack: true,
				options: {
					jetpack_version: '3.8.1'
				}
			} );

			expect( MediaUtils.isSiteAllowedFileTypesToBeTrusted( site ) ).to.be.true;
		} );
	} );

	describe( '#getAllowedFileTypesForSite()', function() {
		it( 'should return an empty array for a falsey site', function() {
			var extensions = MediaUtils.getAllowedFileTypesForSite();

			expect( extensions ).to.be.an.instanceof( Array );
			expect( extensions ).to.be.empty;
		} );

		it( 'should return an array of supported file type extensions', function() {
			var extensions = MediaUtils.getAllowedFileTypesForSite( {
				options: {
					allowed_file_types: [ 'pdf', 'gif' ]
				}
			} );

			expect( extensions ).to.be.contain( 'pdf' );
			expect( extensions ).to.be.contain( 'gif' );
		} );
	} );

	describe( '#isSupportedFileTypeForSite()', function() {
		var site = {
			options: {
				allowed_file_types: [ 'pdf', 'gif' ]
			}
		};

		it( 'should return false for a falsey item', function() {
			expect( MediaUtils.isSupportedFileTypeForSite( null, {} ) ).to.be.false;
		} );

		it( 'should return false for a falsey site', function() {
			expect( MediaUtils.isSupportedFileTypeForSite( {}, null ) ).to.be.false;
		} );

		it( 'should return false if the site doesn\'t support the item\'s extension', function() {
			var item = { extension: 'avi' },
				isSupported = MediaUtils.isSupportedFileTypeForSite( item, site );

			expect( isSupported ).to.be.false;
		} );

		it( 'should return true for versions of Jetpack where option is not synced', function() {
			var isSupported = MediaUtils.isSupportedFileTypeForSite( { extension: 'exe' }, new JetpackSite( {
				jetpack: true,
				options: {
					jetpack_version: '3.8.0'
				}
			} ) );

			expect( isSupported ).to.be.true;
		} );

		it( 'should return false for versions of Jetpack where option is synced and extension is not supported', function() {
			var isSupported = MediaUtils.isSupportedFileTypeForSite( { extension: 'exe' }, new JetpackSite( {
				jetpack: true,
				options: {
					jetpack_version: '3.8.1',
					allowed_file_types: [ 'pdf', 'gif' ]
				}
			} ) );

			expect( isSupported ).to.be.false;
		} );

		it( 'should return true if the site supports the item\'s extension', function() {
			var item = { extension: 'pdf' },
				isSupported = MediaUtils.isSupportedFileTypeForSite( item, site );

			expect( isSupported ).to.be.true;
		} );

		it( 'should return true despite even if different case', function() {
			var item = { extension: 'PdF' },
				isSupported = MediaUtils.isSupportedFileTypeForSite( item, site );

			expect( isSupported ).to.be.true;
		} );
	} );

	describe( '#isExceedingSiteMaxUploadSize()', function() {
		var site = {
			options: {
				max_upload_size: 1024
			}
		};

		it( 'should return null if the provided `bytes` are not numeric', function() {
			expect( MediaUtils.isExceedingSiteMaxUploadSize( undefined, site ) ).to.be.null;
		} );

		it( 'should return null if the site `options` are `undefined`', function() {
			expect( MediaUtils.isExceedingSiteMaxUploadSize( 1024, {} ) ).to.be.null;
		} );

		it( 'should return null if the site `max_upload_size` is `false`', function() {
			var isAcceptableSize = MediaUtils.isExceedingSiteMaxUploadSize( 1024, {
				options: {
					max_upload_size: false
				}
			} );

			expect( isAcceptableSize ).to.be.null;
		} );

		it( 'should return false if the provided `bytes` are less than or equal to `max_upload_size`', function() {
			expect( MediaUtils.isExceedingSiteMaxUploadSize( 512, site ) ).to.be.false;
			expect( MediaUtils.isExceedingSiteMaxUploadSize( 1024, site ) ).to.be.false;
		} );

		it( 'should return true if the provided `bytes` are greater than `max_upload_size`', function() {
			expect( MediaUtils.isExceedingSiteMaxUploadSize( 1025, site ) ).to.be.true;
		} );
	} );

	describe( '#isVideoPressItem()', function() {
		it( 'should return false if passed a falsey item', function() {
			expect( MediaUtils.isVideoPressItem() ).to.be.false;
		} );

		it( 'should return false if no `videopress_guid` property exists', function() {
			expect( MediaUtils.isVideoPressItem( {} ) ).to.be.false;
		} );

		it( 'should return false if the `videopress_guid` property is not a valid guid', function() {
			expect( MediaUtils.isVideoPressItem( { videopress_guid: 'bad!' } ) ).to.be.false;
		} );

		it( 'should return true if the `videopress_guid` property is a valid guid', function() {
			expect( MediaUtils.isVideoPressItem( { videopress_guid: 'h15soamj9k9' } ) ).to.be.true;
		} );
	} );

	describe( '#playtime()', function() {
		it( 'should return undefined if not passed number', function() {
			expect( MediaUtils.playtime() ).to.be.undefined;
		} );

		it( 'should handle specifying seconds as float value', function() {
			expect( MediaUtils.playtime( 5.8 ) ).to.equal( '0:05' );
		} );

		it( 'should handle zero seconds', function() {
			expect( MediaUtils.playtime( 0 ) ).to.equal( '0:00' );
		} );

		it( 'should handle single-digit seconds', function() {
			expect( MediaUtils.playtime( 5 ) ).to.equal( '0:05' );
		} );

		it( 'should handle double-digit seconds', function() {
			expect( MediaUtils.playtime( 55 ) ).to.equal( '0:55' );
		} );

		it( 'should handle single-digit minutes', function() {
			expect( MediaUtils.playtime( 300 ) ).to.equal( '5:00' );
		} );

		it( 'should handle double-digit minutes', function() {
			expect( MediaUtils.playtime( 3300 ) ).to.equal( '55:00' );
		} );

		it( 'should handle single-digit hours', function() {
			expect( MediaUtils.playtime( 18000 ) ).to.equal( '5:00:00' );
		} );

		it( 'should handle double-digit hours', function() {
			expect( MediaUtils.playtime( 198000 ) ).to.equal( '55:00:00' );
		} );

		it( 'should continue to increment hours for long lengths', function() {
			expect( MediaUtils.playtime( 1998000 ) ).to.equal( '555:00:00' );
		} );
	} );

	describe( '#getThumbnailSizeDimensions()', function() {
		it( 'should return the site dimensions if exists', function() {
			var dimensions = MediaUtils.getThumbnailSizeDimensions( 'thumbnail', {
				options: {
					image_thumbnail_width: 200,
					image_thumbnail_height: 200
				}
			} );

			expect( dimensions ).to.eql( {
				width: 200,
				height: 200
			} );
		} );

		it( 'should return default values if site doesn\'t exist', function() {
			var dimensions = MediaUtils.getThumbnailSizeDimensions( 'thumbnail' );

			expect( dimensions ).to.eql( {
				width: 150,
				height: 150
			} );
		} );

		it( 'should return undefined values for unknown size', function() {
			var dimensions = MediaUtils.getThumbnailSizeDimensions( null, null );

			expect( dimensions ).to.eql( {
				width: undefined,
				height: undefined
			} );
		} );
	} );

	describe( '#generateGalleryShortcode()', function() {
		it( 'should generate a gallery shortcode', function() {
			var value = MediaUtils.generateGalleryShortcode( { items: [ { ID: 100 }, { ID: 200 } ] } );

			expect( value ).to.equal( '[gallery ids="100,200"]' );
		} );

		it( 'should accept an optional set of parameters', function() {
			var value = MediaUtils.generateGalleryShortcode( {
				items: [ { ID: 100 }, { ID: 200 } ],
				type: 'square',
				columns: 2
			} );

			expect( value ).to.equal( '[gallery ids="100,200" type="square" columns="2"]' );
		} );

		it( 'should omit size and columns attributes if not used', function() {
			var value = MediaUtils.generateGalleryShortcode( {
				items: [ { ID: 100 }, { ID: 200 } ],
				type: 'rectangular',
				columns: 2
			} );

			expect( value ).to.equal( '[gallery ids="100,200" type="rectangular"]' );
		} );
	} );

	describe( '#canUserDeleteItem()', () => {
		const item = { author_ID: 73705554 };

		it( 'should return false if the user ID matches the item author but user cannot delete posts', () => {
			const user = { ID: 73705554 };
			const site = {
				capabilities: {
					delete_posts: false
				}
			};

			expect( MediaUtils.canUserDeleteItem( item, user, site ) ).to.be.false;
		} );

		it( 'should return true if the user ID matches the item author and user can delete posts', () => {
			const user = { ID: 73705554 };
			const site = {
				capabilities: {
					delete_posts: true
				}
			};

			expect( MediaUtils.canUserDeleteItem( item, user, site ) ).to.be.true;
		} );

		it( 'should return false if the user ID does not match the item author and user cannot delete others posts', () => {
			const user = { ID: 73705672 };
			const site = {
				capabilities: {
					delete_others_posts: false
				}
			};

			expect( MediaUtils.canUserDeleteItem( item, user, site ) ).to.be.false;
		} );

		it( 'should return true if the user ID does not match the item author but user can delete others posts', () => {
			const user = { ID: 73705672 };
			const site = {
				capabilities: {
					delete_others_posts: true
				}
			};

			expect( MediaUtils.canUserDeleteItem( item, user, site ) ).to.be.true;
		} );
	} );
} );
