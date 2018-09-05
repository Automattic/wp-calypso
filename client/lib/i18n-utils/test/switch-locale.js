/** @format */

/**
 * Internal dependencies
 */
import { languageFilePathUrl, languageFileUrl } from 'lib/i18n-utils/switch-locale';
import { setLangRevisions } from 'lib/i18n-utils';

describe( 'languageFileUrl()', () => {
	test( 'should return a JS url.', () => {
		const expected = languageFilePathUrl() + 'ja.js';

		expect( languageFileUrl( 'ja', 'js' ) ).toEqual( expected );
	} );

	test( 'should return a JSON url.', () => {
		const expected = languageFilePathUrl() + 'ja.json';

		expect( languageFileUrl( 'ja', 'json' ) ).toEqual( expected );
	} );

	test( 'should return a JSON url if an unknown fileType is given.', () => {
		const expected = languageFilePathUrl() + 'ja.json';

		expect( languageFileUrl( 'ja', 'Profit!' ) ).toEqual( expected );
	} );

	test( 'should return a protocol-relative path under a browser context.', () => {
		let hasMockedWindow = false;

		if ( ! global.window ) {
			global.window = {};
			hasMockedWindow = true;
		}

		expect( languageFileUrl( 'ja' ).substring( 0, 2 ) ).toEqual( '//' );

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
			const expected = languageFilePathUrl() + 'zh.js?v=123';

			expect( languageFileUrl( 'zh', 'js' ) ).toEqual( expected );
		} );

		test( 'should not append a revision cache buster for an unknown locale.', () => {
			const expected = languageFilePathUrl() + 'kr.js';

			expect( languageFileUrl( 'kr', 'js' ) ).toEqual( expected );
		} );
	} );
} );
