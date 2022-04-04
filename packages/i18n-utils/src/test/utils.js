import { getMappedLanguageSlug } from '../';

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
