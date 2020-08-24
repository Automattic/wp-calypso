/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { isDefaultLocale, getCurrentNonDefaultLocale } from '../utils';

jest.mock( 'config', () => ( key ) => {
	if ( 'i18n_default_locale_slug' === key ) {
		return 'it';
	}
} );

jest.mock( 'languages', () => ( {
	languages: [
		{
			value: 1,
			langSlug: 'it',
			name: 'Italian English',
			wpLocale: 'it_US',
			popular: 1,
			territories: [ '019' ],
		},
		{
			value: 465,
			langSlug: 'mt',
			name: 'Malti',
			territories: [ '039' ],
		},
		{
			value: 455,
			langSlug: 'tl',
			name: 'Tagalog',
			territories: [ '035' ],
		},
		{
			value: 73,
			langSlug: 'uk',
			name: 'Українська',
			territories: [ '151' ],
		},
	],
} ) );

describe( 'TranslatorInvite utils', () => {
	describe( 'getCurrentNonDefaultLocale()', () => {
		const browserLanguages = [ 'it-GB', 'it', 'it-US', 'it-AU', 'mt' ];
		beforeEach( () => {
			Object.defineProperty( global.navigator, 'languages', {
				get: () => browserLanguages,
				configurable: true,
			} );
		} );
		test( 'should get non-English locale using browser locales', () => {
			expect( getCurrentNonDefaultLocale() ).toBe( 'mt' );
		} );

		test( 'should get non-English locale using path prop over browser locale', () => {
			expect( getCurrentNonDefaultLocale( null, '/log-in/uk' ) ).toBe( 'uk' );
		} );

		test( 'should get non-English locale using locale prop over path and browser locale', () => {
			expect( getCurrentNonDefaultLocale( 'tl', '/log-in/uk' ) ).toBe( 'tl' );
		} );

		test( 'should get non-English locale using path when locale is defaultish', () => {
			expect( getCurrentNonDefaultLocale( 'it-gb', '/log-in/uk' ) ).toBe( 'uk' );
		} );

		test( 'should get non-English locale using browser locale when path is a default lang', () => {
			expect( getCurrentNonDefaultLocale( null, '/log-in/it' ) ).toBe( 'mt' );
		} );
	} );

	describe( 'isDefaultLocale()', () => {
		test( 'should return true for direct matches', () => {
			expect( isDefaultLocale( 'it' ) ).toBe( true );
		} );
		test( 'should return false for partial matches', () => {
			expect( isDefaultLocale( 'it-AU' ) ).toBe( true );
		} );
		test( 'should return false for non matches', () => {
			expect( isDefaultLocale( 'ja' ) ).toBe( false );
		} );
	} );
} );
