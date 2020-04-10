/**
 * External dependencies
 */
import { set, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getLanguageFilePathUrl,
	getLanguageFileUrl,
	getLanguageManifestFileUrl,
	getLanguagesInternalBasePath,
	getTranslationChunkFileUrl,
} from 'lib/i18n-utils/switch-locale';

describe( 'getLanguageFileUrl()', () => {
	test( 'should return a JS url.', () => {
		const expected = getLanguageFilePathUrl() + 'ja-v1.1.js';

		expect( getLanguageFileUrl( 'ja', 'js' ) ).toEqual( expected );
	} );

	test( 'should return a JSON url.', () => {
		const expected = getLanguageFilePathUrl() + 'ja-v1.1.json';

		expect( getLanguageFileUrl( 'ja', 'json' ) ).toEqual( expected );
	} );

	test( 'should return a JSON url if an unknown fileType is given.', () => {
		const expected = getLanguageFilePathUrl() + 'ja-v1.1.json';

		expect( getLanguageFileUrl( 'ja', 'Profit!' ) ).toEqual( expected );
	} );

	test( 'should return a protocol-relative path under a browser context.', () => {
		let hasMockedWindow = false;

		if ( ! global.window ) {
			global.window = {};
			hasMockedWindow = true;
		}

		expect( startsWith( getLanguageFileUrl( 'ja' ), '//' ) ).toBe( true );

		if ( hasMockedWindow ) {
			global.window = null;
		}
	} );

	test( 'should append a revision cache buster.', () => {
		const expected = getLanguageFilePathUrl() + 'zh-v1.1.js?v=123';

		expect( getLanguageFileUrl( 'zh', 'js', { zh: 123 } ) ).toEqual( expected );
	} );

	test( 'should not append a revision cache buster for an unknown locale.', () => {
		const expected = getLanguageFilePathUrl() + 'kr-v1.1.js';

		expect( getLanguageFileUrl( 'kr', 'js', { xd: 222 } ) ).toEqual( expected );
	} );

	test( 'should not use a non-number revision', () => {
		const expected = getLanguageFilePathUrl() + 'zh-v1.1.js';

		expect( getLanguageFileUrl( 'zh', 'js', { zh: 'what-is-this?' } ) ).toEqual( expected );
	} );
} );

describe( 'getLanguagesInternalBasePath()', () => {
	test( 'should return base path for languages.', () => {
		if ( ! global.window || ! global.__requireChunkCallback__ ) {
			const expected = '/calypso/evergreen/languages';

			expect( getLanguagesInternalBasePath() ).toEqual( expected );
		}

		let hasMockedWindow = false;
		let hasMockedRequireChunkCallback = false;

		if ( ! global.window || ! global.window.__requireChunkCallback__ ) {
			hasMockedWindow = ! global.window;
			hasMockedRequireChunkCallback = ! global.window || ! global.window.__requireChunkCallback__;

			const mockFn = jest.fn( () => '/calypso/fallback/' );
			set( global, [ 'window', '__requireChunkCallback__', 'getPublicPath' ], mockFn );

			const expected = '/calypso/fallback/languages';
			expect( getLanguagesInternalBasePath() ).toEqual( expected );
			expect( mockFn ).toHaveBeenCalled();
		}

		if ( hasMockedRequireChunkCallback ) {
			global.window.__requireChunkCallback__ = null;
		}

		if ( hasMockedWindow ) {
			global.window = null;
		}
	} );
} );

describe( 'getLanguageManifestFileUrl()', () => {
	test( 'should return language manifest url for a given locale.', () => {
		const expected = getLanguagesInternalBasePath() + '/ja-language-manifest.json';

		expect( getLanguageManifestFileUrl( 'ja' ) ).toEqual( expected );
	} );

	test( 'should append a revision cache buster.', () => {
		const expected = getLanguagesInternalBasePath() + '/zh-language-manifest.json?v=123';

		expect( getLanguageManifestFileUrl( 'zh', { zh: 123 } ) ).toEqual( expected );
	} );

	test( 'should not append a revision cache buster for an unknown locale.', () => {
		const expected = getLanguagesInternalBasePath() + '/kr-language-manifest.json';

		expect( getLanguageManifestFileUrl( 'kr', { xd: 222 } ) ).toEqual( expected );
	} );
} );

describe( 'getTranslationChunkFileUrl()', () => {
	test( 'should return language manifest url for a given locale.', () => {
		const locale = 'ja';
		const chunkId = 'chunk-abc.min';
		const expected = `${ getLanguagesInternalBasePath() }/${ locale }-${ chunkId }.json`;

		expect( getTranslationChunkFileUrl( chunkId, locale ) ).toEqual( expected );
	} );

	test( 'should append a revision cache buster.', () => {
		const locale = 'zh';
		const chunkId = 'chunk-abc.min';
		const expected = `${ getLanguagesInternalBasePath() }/${ locale }-${ chunkId }.json?v=123`;

		expect( getTranslationChunkFileUrl( chunkId, locale, { zh: 123 } ) ).toEqual( expected );
	} );

	test( 'should not append a revision cache buster for an unknown locale.', () => {
		const locale = 'kr';
		const chunkId = 'chunk-abc.min';
		const expected = `${ getLanguagesInternalBasePath() }/${ locale }-${ chunkId }.json`;

		expect( getTranslationChunkFileUrl( chunkId, locale, { xd: 222 } ) ).toEqual( expected );
	} );
} );
