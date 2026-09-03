/**
 * @jest-environment jsdom
 */

import { ValidationErrors as MediaValidationErrors } from '../constants';
import * as MediaUtils from '../utils';

const UNIQUEID = 'media-fake-uuid';
const DUMMY_FILENAME = 'test.jpg';
const DUMMY_FILE_BLOB = {
	fileContents: {
		size: 1,
	},
	fileName: DUMMY_FILENAME,
};
const DUMMY_FILE_OBJECT = {
	thumbnails: true,
	URL: DUMMY_FILENAME,
	name: DUMMY_FILENAME,
	extension: 'jpg',
	mime_type: 'image/jpeg',
};
const EXPECTED = {
	transient: true,
	ID: UNIQUEID,
	file: DUMMY_FILENAME,
	title: 'test.jpg',
	extension: 'jpg',
	mime_type: 'image/jpeg',
};
const EXPECTED_FILE_OBJECT = {
	transient: true,
	ID: UNIQUEID,
	file: DUMMY_FILENAME,
	title: 'test.jpg',
	caption: '',
	extension: 'jpg',
	mime_type: 'image/jpeg',
	guid: DUMMY_FILENAME,
	URL: DUMMY_FILENAME,
	external: true,
};

let originalRandomUUID;

beforeAll( () => {
	originalRandomUUID = global.crypto.randomUUID;
	global.crypto.randomUUID = () => 'fake-uuid';
} );

afterAll( () => {
	global.crypto.randomUUID = originalRandomUUID;
} );

describe( 'MediaUtils', () => {
	describe( '#url()', () => {
		let media;

		beforeEach( () => {
			media = {
				URL: 'https://secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6',
				thumbnails: {
					thumbnail: 'https://secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6?s=150',
				},
			};
		} );

		test( 'should simply return the URL if media is transient', () => {
			media.transient = true;

			const url = MediaUtils.url( media, {
				maxWidth: 450,
			} );

			expect( url ).toEqual( media.URL );
		} );

		test( 'should accept a media object without options, returning the URL', () => {
			const url = MediaUtils.url( media );

			expect( url ).toEqual( media.URL );
		} );

		test( 'should accept a photon option to use the photon service', () => {
			const url = MediaUtils.url( media, {
				photon: true,
			} );

			expect( url ).toEqual(
				'https://i0.wp.com/secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6?ssl=1'
			);
		} );

		test( 'should generate the correct width-constrained photon URL', () => {
			const url = MediaUtils.url( media, {
				photon: true,
				maxWidth: 450,
			} );

			expect( url ).toEqual(
				'https://i0.wp.com/secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6?ssl=1&w=450'
			);
		} );

		test( 'should generate the correct width-constrained URL', () => {
			const url = MediaUtils.url( media, {
				maxWidth: 450,
			} );

			expect( url ).toEqual(
				'https://secure.gravatar.com/blavatar/4e21d703d81809d215ceaabbf07efbc6?w=450'
			);
		} );

		test( 'should attempt to find and return a desired thumbnail size', () => {
			const url = MediaUtils.url( media, {
				size: 'thumbnail',
			} );

			expect( url ).toEqual( media.thumbnails.thumbnail );
		} );

		test( 'should gracefully handle empty media objects', () => {
			const url = MediaUtils.url(
				{},
				{
					size: 'thumbnail',
					maxWidth: 450,
				}
			);

			expect( url ).toBeUndefined();
		} );
	} );

	describe( '#getFileExtension()', () => {
		test( 'should return undefined for a falsey media value', () => {
			expect( MediaUtils.getFileExtension() ).toBeUndefined();
		} );

		test( 'should detect extension from file name', () => {
			expect( MediaUtils.getFileExtension( 'example.gif' ) ).toEqual( 'gif' );
		} );

		test( 'should handle reserved url characters in filename', () => {
			expect( MediaUtils.getFileExtension( 'example#?#?.gif' ) ).toEqual( 'gif' );
		} );

		test( 'should detect extension from HTML5 File object', () => {
			expect( MediaUtils.getFileExtension( new window.File( [ '' ], 'example.gif' ) ) ).toEqual(
				'gif'
			);
		} );

		test( 'should detect extension from HTML5 File object with reserved url chars', () => {
			expect( MediaUtils.getFileExtension( new window.File( [ '' ], 'example#?#?.gif' ) ) ).toEqual(
				'gif'
			);
		} );

		test( 'should detect extension from object file property', () => {
			expect( MediaUtils.getFileExtension( { file: 'example.gif' } ) ).toEqual( 'gif' );
		} );

		test( 'should detect extension from already computed extension property', () => {
			expect( MediaUtils.getFileExtension( { extension: 'gif' } ) ).toEqual( 'gif' );
		} );

		test( 'should detect extension from object URL property', () => {
			expect( MediaUtils.getFileExtension( { URL: 'example.gif' } ) ).toEqual( 'gif' );
		} );

		test( 'should detect extension from object guid property', () => {
			expect( MediaUtils.getFileExtension( { guid: 'example.gif' } ) ).toEqual( 'gif' );
		} );

		test( 'should detect extension from URL string with query parameters', () => {
			expect( MediaUtils.getFileExtension( 'https://example.com/example.gif?w=110' ) ).toEqual(
				'gif'
			);
		} );
	} );

	describe( '#getMimeType()', () => {
		test( 'should return undefined for a falsey media value', () => {
			expect( MediaUtils.getMimeType() ).toBeUndefined();
		} );

		test( "should return undefined if detected extension doesn't exist in mime_types", () => {
			expect( MediaUtils.getMimeType( 'file.badextension' ) ).toBeUndefined();
		} );

		test( 'should return an object mime type', () => {
			expect( MediaUtils.getMimeType( { mime_type: 'application/fake' } ) ).toEqual(
				'application/fake'
			);
		} );

		test( 'should detect mime type from string extension', () => {
			expect( MediaUtils.getMimeType( 'example.gif' ) ).toEqual( 'image/gif' );
		} );

		test( 'should detect mime type with reserved url characters in filename', () => {
			expect( MediaUtils.getMimeType( 'example#?#?.gif' ) ).toEqual( 'image/gif' );
		} );

		test( 'should ignore invalid filenames', () => {
			expect( MediaUtils.getMimeType( 'example#?#?.gif?w=100' ) ).toBeUndefined();
		} );

		test( 'should detect mime type from HTML5 File object', () => {
			expect(
				MediaUtils.getMimeType( new window.File( [ '' ], 'example.gif', { type: 'image/gif' } ) )
			).toEqual( 'image/gif' );
		} );

		test( 'should detect mime type from object file property', () => {
			expect( MediaUtils.getMimeType( { file: 'example.gif' } ) ).toEqual( 'image/gif' );
		} );

		test( 'should detect mime type from object URL property', () => {
			expect( MediaUtils.getMimeType( { URL: 'example.gif' } ) ).toEqual( 'image/gif' );
		} );

		test( 'should ignore query string parameters', () => {
			expect( MediaUtils.getMimeType( { URL: 'example.gif?w=110' } ) ).toEqual( 'image/gif' );
		} );

		test( 'should ignore query string parameters in URL strings', () => {
			expect( MediaUtils.getMimeType( 'https://example.com/example.gif?w=110' ) ).toEqual(
				'image/gif'
			);
		} );

		test( 'should detect mime type from object guid property', () => {
			expect( MediaUtils.getMimeType( { guid: 'example.gif' } ) ).toEqual( 'image/gif' );
		} );

		test( 'should detect mime type regardless of extension case', () => {
			expect( MediaUtils.getMimeType( 'example.GIF' ) ).toEqual( 'image/gif' );
		} );
	} );

	describe( '#getAllowedFileTypesForSite()', () => {
		test( 'should return an empty array for a falsey site', () => {
			const extensions = MediaUtils.getAllowedFileTypesForSite();

			expect( extensions ).toBeInstanceOf( Array );
			expect( Object.keys( extensions ) ).toHaveLength( 0 );
		} );

		test( 'should return an array of supported file type extensions', () => {
			const extensions = MediaUtils.getAllowedFileTypesForSite( {
				options: {
					allowed_file_types: [ 'pdf', 'gif' ],
				},
			} );

			expect( extensions ).toContain( 'pdf' );
			expect( extensions ).toContain( 'gif' );
		} );
	} );

	describe( '#isSupportedFileTypeForSite()', () => {
		const site = {
			options: {
				allowed_file_types: [ 'pdf', 'gif' ],
			},
		};

		test( 'should return false for a falsey item', () => {
			expect( MediaUtils.isSupportedFileTypeForSite( null, {} ) ).toBe( false );
		} );

		test( 'should return false for a falsey site', () => {
			expect( MediaUtils.isSupportedFileTypeForSite( {}, null ) ).toBe( false );
		} );

		test( "should return false if the site doesn't support the item's extension", () => {
			const item = { extension: 'avi' };
			const isSupported = MediaUtils.isSupportedFileTypeForSite( item, site );

			expect( isSupported ).toBe( false );
		} );

		test( 'should return true for versions of Jetpack where option is not synced', () => {
			const isSupported = MediaUtils.isSupportedFileTypeForSite(
				{ extension: 'exe' },
				{
					jetpack: true,
				}
			);

			expect( isSupported ).toBe( true );
		} );

		test( "should return true if the site supports the item's extension", () => {
			const item = { extension: 'pdf' };
			const isSupported = MediaUtils.isSupportedFileTypeForSite( item, site );

			expect( isSupported ).toBe( true );
		} );

		test( 'should return true despite even if different case', () => {
			const item = { extension: 'PdF' };
			const isSupported = MediaUtils.isSupportedFileTypeForSite( item, site );

			expect( isSupported ).toBe( true );
		} );
	} );

	describe( '#isExceedingSiteMaxUploadSize()', () => {
		const site = {
			jetpack: false,
			options: {
				max_upload_size: 1024,
			},
		};
		const jetpackSite = {
			jetpack: true,
			options: {
				max_upload_size: 1024,
				active_modules: [ 'videopress' ],
			},
		};

		test( 'should return null if the provided `bytes` are not numeric', () => {
			expect( MediaUtils.isExceedingSiteMaxUploadSize( {}, site ) ).toBeNull();
		} );

		test( 'should return null if the site `options` are `undefined`', () => {
			expect( MediaUtils.isExceedingSiteMaxUploadSize( { size: 1024 }, {} ) ).toBeNull();
		} );

		test( 'should return null if the site `max_upload_size` is `false`', () => {
			const isAcceptableSize = MediaUtils.isExceedingSiteMaxUploadSize(
				{ size: 1024 },
				{
					options: {
						max_upload_size: false,
					},
				}
			);

			expect( isAcceptableSize ).toBeNull();
		} );

		test( 'should return null if a video is being uploaded for a Jetpack site with VideoPress enabled', () => {
			expect(
				MediaUtils.isExceedingSiteMaxUploadSize(
					{ size: 1024, mime_type: 'video/mp4' },
					jetpackSite
				)
			).toBeNull();
		} );

		test( 'should not return null if an image is being uploaded for a Jetpack site with VideoPress enabled', () => {
			expect(
				MediaUtils.isExceedingSiteMaxUploadSize(
					{ size: 1024, mime_type: 'image/jpeg' },
					jetpackSite
				)
			).not.toBeNull();
		} );

		test( 'should not return null if a video is being uploaded for a Jetpack site with VideoPress disabled', () => {
			const isAcceptableSize = MediaUtils.isExceedingSiteMaxUploadSize(
				{ size: 1024, mime_type: 'video/mp4' },
				{
					jetpack: true,
					options: {
						max_upload_size: 1024,
					},
				}
			);

			expect( isAcceptableSize ).not.toBeNull();
		} );

		test( 'should return false if the provided `bytes` are less than or equal to `max_upload_size`', () => {
			expect( MediaUtils.isExceedingSiteMaxUploadSize( { size: 512 }, site ) ).toBe( false );
			expect( MediaUtils.isExceedingSiteMaxUploadSize( { size: 1024 }, site ) ).toBe( false );
		} );

		test( 'should return true if the provided `bytes` are greater than `max_upload_size`', () => {
			expect( MediaUtils.isExceedingSiteMaxUploadSize( { size: 1025 }, site ) ).toBe( true );
		} );
	} );

	describe( '#createTransientMedia()', () => {
		const GUID = 'URL';
		const originalURL = window.URL;

		beforeEach( () => {
			window.URL = {
				createObjectURL: () => {
					return GUID;
				},
			};
		} );

		afterEach( () => {
			window.URL = originalURL;
		} );

		test( 'should return a transient for a file blob', () => {
			const actual = MediaUtils.createTransientMedia( DUMMY_FILE_BLOB );
			const expected = Object.assign( {}, EXPECTED, {
				URL: GUID,
				guid: GUID,
				size: 1,
			} );

			expect( actual ).toEqual( expected );
		} );

		test( 'should return a transient for a filename', () => {
			const actual = MediaUtils.createTransientMedia( DUMMY_FILENAME );

			expect( actual ).toEqual( EXPECTED );
		} );

		test( 'should return a transient for a file object', () => {
			const actual = MediaUtils.createTransientMedia( DUMMY_FILE_OBJECT );

			expect( actual ).toEqual( EXPECTED_FILE_OBJECT );
		} );
	} );

	describe( '#validateMediaItem()', () => {
		const site = {
			options: {
				allowed_file_types: [ 'pdf', 'gif' ],
				max_upload_size: 123456789,
			},
		};

		test( 'should return no errors if file type is supported', () => {
			const mediaItem = {
				...EXPECTED_FILE_OBJECT,
				extension: 'gif',
			};
			expect( MediaUtils.validateMediaItem( site, mediaItem ) ).toEqual( [] );
		} );

		test( 'should return an error if file type is unsupported', () => {
			expect( MediaUtils.validateMediaItem( site, EXPECTED_FILE_OBJECT ) ).toEqual( [
				MediaValidationErrors.FILE_TYPE_UNSUPPORTED,
			] );
		} );

		test( 'should return an error if file type is not in plan', () => {
			const mediaItem = {
				...EXPECTED_FILE_OBJECT,
				extension: 'mp4',
			};
			expect( MediaUtils.validateMediaItem( site, mediaItem ) ).toEqual( [
				MediaValidationErrors.FILE_TYPE_NOT_IN_PLAN,
			] );
		} );

		test( 'should return an error if file exceeds the maximum upload file size', () => {
			const mediaItem = {
				...EXPECTED_FILE_OBJECT,
				extension: 'gif',
				size: 123456790,
			};
			expect( MediaUtils.validateMediaItem( site, mediaItem ) ).toEqual( [
				MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE,
			] );
		} );

		test( 'should return both upload file size and unsupported file type errors', () => {
			const mediaItem = {
				...EXPECTED_FILE_OBJECT,
				size: 123456790,
			};
			expect( MediaUtils.validateMediaItem( site, mediaItem ) ).toEqual( [
				MediaValidationErrors.FILE_TYPE_UNSUPPORTED,
				MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE,
			] );
		} );
	} );

	describe( '#mediaURLToProxyConfig()', () => {
		test( 'should detect media relative to site URL', () => {
			expect(
				MediaUtils.mediaURLToProxyConfig( 'https://test.com/media.jpg', 'test.com' )
			).toEqual( {
				query: '',
				filePath: '/media.jpg',
				isRelativeToSiteRoot: true,
			} );
		} );

		test( 'should detect query string of given URL', () => {
			expect(
				MediaUtils.mediaURLToProxyConfig( 'https://test.com/media.jpg?w=100&h=98', 'test.com' )
			).toEqual( {
				query: '?w=100&h=98',
				filePath: '/media.jpg',
				isRelativeToSiteRoot: true,
			} );
		} );

		test( 'should detect domain mismatch', () => {
			expect(
				MediaUtils.mediaURLToProxyConfig( 'https://test.com/media.jpg', 'test2.com' )
			).toEqual( {
				query: '',
				filePath: '/media.jpg',
				isRelativeToSiteRoot: false,
			} );
		} );

		test( 'should recognize photon URLs as ones relative to site URL', () => {
			expect(
				MediaUtils.mediaURLToProxyConfig( 'https://i0.wp.com/test.com/media.jpg?w=100', 'test.com' )
			).toEqual( {
				query: '?w=100',
				filePath: '/media.jpg',
				isRelativeToSiteRoot: true,
			} );
		} );

		test( 'should not recognize non-photon wp.com URLs as ones relative to site URL', () => {
			expect(
				MediaUtils.mediaURLToProxyConfig(
					'https://bad.wp.com/test.com/media.jpg?w=100',
					'test.com'
				)
			).toEqual( {
				query: '?w=100',
				filePath: '/test.com/media.jpg',
				isRelativeToSiteRoot: false,
			} );
		} );

		test( 'should recognize domain mismatch in photon URL', () => {
			expect(
				MediaUtils.mediaURLToProxyConfig(
					'https://i0.wp.com/test.com/media.jpg?w=100',
					'test2.com'
				)
			).toEqual( {
				query: '?w=100',
				filePath: '/media.jpg',
				isRelativeToSiteRoot: false,
			} );
		} );

		test( 'should not consider URLs with non-http protocols as relative to domain root', () => {
			expect(
				MediaUtils.mediaURLToProxyConfig( 'blob://test.com/media.jpg?w=100', 'test.com' )
			).toEqual( {
				query: '?w=100',
				filePath: '/media.jpg',
				isRelativeToSiteRoot: false,
			} );
		} );
	} );
} );
