import {
	getMappedLanguageSlug,
	getNumericFirstDayOfWeek,
	removeLocaleFromPathLocaleInFront,
	addLocaleToPathLocaleInFront,
	getLanguage,
	filterLanguageRevisions,
} from '../';

jest.mock( '@automattic/calypso-config', () => ( key ) => {
	if ( 'i18n_default_locale_slug' === key ) {
		return 'en';
	}
} );

describe( '#getMappedLanguageSlug', () => {
	test( 'should Norwegian `no` locale slug to `nb`.', () => {
		expect( getMappedLanguageSlug( 'no' ) ).toBe( 'nb' );
	} );

	test( 'should preserve the same locale slug when mapping is not applicable', () => {
		expect( getMappedLanguageSlug( 'en' ) ).toBe( 'en' );
		expect( getMappedLanguageSlug( 'de' ) ).toBe( 'de' );
		expect( getMappedLanguageSlug( 'he' ) ).toBe( 'he' );
	} );
} );

describe( '#getNumericFirstDayOfWeek', () => {
	test( 'should correctly return the first day of week based on locale', () => {
		expect( getNumericFirstDayOfWeek( 'de' ) ).toBe( 1 ); // Monday
		expect( getNumericFirstDayOfWeek( 'ar-dz' ) ).toBe( 6 ); // Saturday
		expect( getNumericFirstDayOfWeek( 'en' ) ).toBe( 7 ); // Sunday
		expect( getNumericFirstDayOfWeek( 'wrong' ) ).toBe( 1 ); // Wrong locales cause default to be used
	} );
} );

describe( '#removeLocaleFromPathLocaleInFront', () => {
	test( 'should correctly return the real path when locale is at the beginning of the path', () => {
		expect( removeLocaleFromPathLocaleInFront( '/en/themes' ) ).toBe( '/themes' );
		expect( removeLocaleFromPathLocaleInFront( '/themes' ) ).toBe( '/themes' );
		expect( removeLocaleFromPathLocaleInFront( '/de/themes' ) ).toBe( '/themes' );
	} );
} );

describe( '#addLocaleToPathLocaleInFront', () => {
	test( 'should correctly return the real path when locale is at the beginning of the path', () => {
		expect( addLocaleToPathLocaleInFront( '/en/themes', 'fr' ) ).toBe( '/fr/themes' );
		expect( addLocaleToPathLocaleInFront( '/themes?thing=stuff', 'en' ) ).toBe(
			'/themes?thing=stuff'
		);
	} );
} );

describe( '#getLanguage', () => {
	test( 'should return undefined for undefined input', () => {
		expect( getLanguage( undefined ) ).toBeUndefined();
	} );

	test( 'should return undefined for invalid locale format', () => {
		expect( getLanguage( '123' ) ).toBeUndefined();
		expect( getLanguage( 'invalid-locale' ) ).toBeUndefined();
		expect( getLanguage( 'a' ) ).toBeUndefined();
	} );

	test( 'should handle locale mapping (no -> nb)', () => {
		const result = getLanguage( 'no' );
		expect( result ).toBeDefined();
		expect( result?.langSlug ).toBe( 'nb' );
	} );

	test( 'should return exact match for valid locale', () => {
		const result = getLanguage( 'en' );
		expect( result ).toBeDefined();
		expect( result?.langSlug ).toBe( 'en' );
	} );

	test( 'should return exact match for locale with region code', () => {
		const result = getLanguage( 'pt-br' );
		expect( result ).toBeDefined();
		expect( result?.langSlug ).toBe( 'pt-br' );
	} );

	test( 'should fallback to parent slug when exact match not found', () => {
		const result = getLanguage( 'en-nz' );
		expect( result?.langSlug ).toBe( 'en' );
	} );

	test( 'should handle locale with underscore separator', () => {
		const result = getLanguage( 'en_nz' );
		expect( result?.langSlug ).toBe( 'en' );
	} );

	test( 'should return undefined when neither exact match nor parent slug exists', () => {
		const result = getLanguage( 'xx-yy' );
		expect( result ).toBeUndefined();
	} );

	test( 'should handle case sensitivity', () => {
		const result = getLanguage( 'EN' );
		// Should be undefined since locale matching is case-sensitive
		expect( result ).toBeUndefined();
	} );
} );

describe( '#filterLanguageRevisions', () => {
	test( 'should return empty object for empty input', () => {
		const result = filterLanguageRevisions( {} );
		expect( result ).toEqual( {} );
	} );

	test( 'should filter out non-numeric revision values', () => {
		const input = {
			en: 123,
			fr: 'invalid',
			de: null,
			es: undefined,
			pt: 456,
		};
		const result = filterLanguageRevisions( input );
		expect( result ).toEqual( {
			en: 123,
			pt: 456,
		} );
	} );

	test( 'should filter out unsupported language slugs', () => {
		const input = {
			en: 123,
			'invalid-lang': 456,
			fr: 789,
			'another-invalid': 999,
		};
		const result = filterLanguageRevisions( input );
		// Only keep entries with valid language slugs and numeric revisions
		expect( result.en ).toBe( 123 );
		expect( result.fr ).toBe( 789 );
		expect( result[ 'invalid-lang' ] ).toBeUndefined();
		expect( result[ 'another-invalid' ] ).toBeUndefined();
	} );

	test( 'should preserve all valid entries', () => {
		const input = {
			en: 123,
			fr: 456,
			de: 789,
			es: 999,
		};
		const result = filterLanguageRevisions( input );
		// All should be preserved if they're valid language slugs
		expect( Object.keys( result ).length ).toBeGreaterThan( 0 );
		Object.entries( result ).forEach( ( [ slug, revision ] ) => {
			expect( typeof revision ).toBe( 'number' );
			expect( input[ slug ] ).toBe( revision );
		} );
	} );
} );
