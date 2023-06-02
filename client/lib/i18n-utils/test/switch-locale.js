import { startsWith } from 'lodash';
import {
	getLanguageFilePathUrl,
	getLanguageFileUrl,
	getLanguageManifestFileUrl,
	getLanguagesInternalBasePath,
	getTranslationChunkFileUrl,
} from 'calypso/lib/i18n-utils/switch-locale';

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
		const expectedWithNumberRevision = getLanguageFilePathUrl() + 'zh-v1.1.js?v=123';

		expect( getLanguageFileUrl( 'zh', 'js', { zh: 123 } ) ).toEqual( expectedWithNumberRevision );

		const expectedWithStringRevision = getLanguageFilePathUrl() + 'de-v1.1.js?v=abc123';

		expect( getLanguageFileUrl( 'de', 'js', { de: 'abc123' } ) ).toEqual(
			expectedWithStringRevision
		);
	} );

	test( 'should not append a revision cache buster for an unknown locale.', () => {
		const expected = getLanguageFilePathUrl() + 'kr-v1.1.js';

		expect( getLanguageFileUrl( 'kr', 'js', { xd: 222 } ) ).toEqual( expected );
	} );

	test( 'should not use a non-number-or-string revision', () => {
		const expected = getLanguageFilePathUrl() + 'zh-v1.1.js';

		expect( getLanguageFileUrl( 'zh', 'js', { zh: true } ) ).toEqual( expected );
	} );
} );

describe( 'getLanguagesInternalBasePath()', () => {
	test( 'should return base path for languages.', () => {
		expect( getLanguagesInternalBasePath() ).toEqual( '/calypso/languages' );
	} );
} );

describe( 'getLanguageManifestFileUrl()', () => {
	test( 'should return language manifest url for a given locale.', () => {
		const expected = getLanguagesInternalBasePath() + '/ja-language-manifest.json';

		expect( getLanguageManifestFileUrl( { localeSlug: 'ja' } ) ).toEqual( expected );
	} );

	test( 'should append a revision cache buster.', () => {
		const hash = '123';
		const expected = `${ getLanguagesInternalBasePath() }/zh-language-manifest.json?v=${ hash }`;

		expect( getLanguageManifestFileUrl( { localeSlug: 'zh', hash } ) ).toEqual( expected );
	} );

	test( 'should not append a revision cache buster for an unknown locale.', () => {
		const expected = getLanguagesInternalBasePath() + '/kr-language-manifest.json';

		expect(
			getLanguageManifestFileUrl( { localeSlug: 'kr', languageRevisions: { xd: 222 } } )
		).toEqual( expected );
	} );
} );

describe( 'getTranslationChunkFileUrl()', () => {
	test( 'should return translation chunk url for a given locale.', () => {
		const localeSlug = 'ja';
		const chunkId = 'chunk-abc.min';
		const expected = `${ getLanguagesInternalBasePath() }/${ localeSlug }-${ chunkId }.json`;

		expect( getTranslationChunkFileUrl( { chunkId, localeSlug } ) ).toEqual( expected );
	} );

	test( 'should append a revision cache buster.', () => {
		const localeSlug = 'zh';
		const chunkId = 'chunk-abc.min';
		const hash = '123';
		const expected = `${ getLanguagesInternalBasePath() }/${ localeSlug }-${ chunkId }.json?v=${ hash }`;

		expect( getTranslationChunkFileUrl( { chunkId, localeSlug, hash } ) ).toEqual( expected );
	} );

	test( 'should not append a revision cache buster for an unknown locale.', () => {
		const localeSlug = 'kr';
		const chunkId = 'chunk-abc.min';
		const expected = `${ getLanguagesInternalBasePath() }/${ localeSlug }-${ chunkId }.json`;

		expect(
			getTranslationChunkFileUrl( { chunkId, localeSlug, languageRevisions: { xd: 222 } } )
		).toEqual( expected );
	} );
} );
