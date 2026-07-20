import camelCase from '../camel-case';

describe( 'camelCase', () => {
	it( 'converts snake, kebab, spaced, and Pascal input to camelCase', () => {
		expect( camelCase( 'foo_bar' ) ).toBe( 'fooBar' );
		expect( camelCase( 'foo-bar' ) ).toBe( 'fooBar' );
		expect( camelCase( 'Foo Bar' ) ).toBe( 'fooBar' );
		expect( camelCase( 'FOO_BAR' ) ).toBe( 'fooBar' );
		expect( camelCase( 'country-code' ) ).toBe( 'countryCode' );
	} );

	it( 'is idempotent on already-camelCase input', () => {
		expect( camelCase( 'fooBar' ) ).toBe( 'fooBar' );
		expect( camelCase( 'firstName' ) ).toBe( 'firstName' );
	} );

	it( 'splits acronym and numeric boundaries', () => {
		expect( camelCase( 'XMLHttpRequest' ) ).toBe( 'xmlHttpRequest' );
		expect( camelCase( 'parseURL' ) ).toBe( 'parseUrl' );
		expect( camelCase( 'version1Point2' ) ).toBe( 'version1Point2' );
	} );

	it( 'is scoped to ASCII — accents/apostrophes are not deburred', () => {
		// These helpers tokenize ASCII only, so accents are not deburred.
		expect( camelCase( 'déjà-vu' ) ).toBe( 'dJVu' );
		expect( camelCase( "it's-here" ) ).toBe( 'itSHere' );
	} );

	it( 'returns an empty string for nullish input', () => {
		expect( camelCase( null ) ).toBe( '' );
		expect( camelCase( undefined ) ).toBe( '' );
		expect( camelCase( '' ) ).toBe( '' );
	} );
} );
