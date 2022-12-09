import { getMappedLanguageSlug, getRealPathName } from '../';

jest.mock( '@automattic/calypso-config', () => ( {} ) );

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

describe( '#getRealPathName', () => {
	test( 'should correctly return the real path when locale is at the beginning of the path', () => {
		expect( getRealPathName( '/en/themes' ) ).toBe( '/themes' );
		expect( getRealPathName( '/themes' ) ).toBe( '/themes' );
		expect( getRealPathName( '/de/themes' ) ).toBe( '/themes' );
	} );

	test( 'should correctly return the real path when locale is at the end of the path', () => {
		expect( getRealPathName( '/themes/en' ) ).toBe( '/themes' );
		expect( getRealPathName( '/themes' ) ).toBe( '/themes' );
		expect( getRealPathName( '/themes/de' ) ).toBe( '/themes' );
	} );
} );
