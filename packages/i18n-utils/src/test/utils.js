import {
	getMappedLanguageSlug,
	getNumericFirstDayOfWeek,
	removeLocaleFromPathLocaleInFront,
	addLocaleToPathLocaleInFront,
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
