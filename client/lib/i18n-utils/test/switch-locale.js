/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { getLanguageFilePathUrl, getLanguageFileUrl } from 'lib/i18n-utils/switch-locale';

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
