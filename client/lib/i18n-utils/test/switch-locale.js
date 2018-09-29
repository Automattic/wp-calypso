/** @format */
/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { getLanguageFilePathUrl, getLanguageFileUrl } from 'lib/i18n-utils/switch-locale';
import { setLangRevisions } from 'lib/i18n-utils';

describe( 'getLanguageFileUrl()', () => {
	test( 'should return a JS url.', () => {
		const expected = getLanguageFilePathUrl() + 'ja.js';

		expect( getLanguageFileUrl( 'ja', 'js' ) ).toEqual( expected );
	} );

	test( 'should return a JSON url.', () => {
		const expected = getLanguageFilePathUrl() + 'ja.json';

		expect( getLanguageFileUrl( 'ja', 'json' ) ).toEqual( expected );
	} );

	test( 'should return a JSON url if an unknown fileType is given.', () => {
		const expected = getLanguageFilePathUrl() + 'ja.json';

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

	describe( 'revision number as a cache buster', () => {
		beforeAll( () => {
			setLangRevisions( { zh: 123 } );
		} );

		afterAll( () => {
			setLangRevisions( {} );
		} );

		test( 'should append a revision cache buster.', () => {
			const expected = getLanguageFilePathUrl() + 'zh.js?v=123';

			expect( getLanguageFileUrl( 'zh', 'js' ) ).toEqual( expected );
		} );

		test( 'should not append a revision cache buster for an unknown locale.', () => {
			const expected = getLanguageFilePathUrl() + 'kr.js';

			expect( getLanguageFileUrl( 'kr', 'js' ) ).toEqual( expected );
		} );
	} );
} );
