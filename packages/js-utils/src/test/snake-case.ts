import snakeCase from '../snake-case';

describe( 'snakeCase', () => {
	it( 'converts camel, kebab, and spaced input to snake_case', () => {
		expect( snakeCase( 'fooBar' ) ).toBe( 'foo_bar' );
		expect( snakeCase( 'foo-bar' ) ).toBe( 'foo_bar' );
		expect( snakeCase( 'Foo Bar' ) ).toBe( 'foo_bar' );
		expect( snakeCase( 'blocked-uri' ) ).toBe( 'blocked_uri' );
		expect( snakeCase( 'country-code' ) ).toBe( 'country_code' );
	} );

	it( 'splits acronym and numeric boundaries like lodash', () => {
		expect( snakeCase( 'XMLHttpRequest' ) ).toBe( 'xml_http_request' );
		expect( snakeCase( 'address1' ) ).toBe( 'address_1' );
	} );

	it( 'leaves plain lowercase identifiers unchanged', () => {
		expect( snakeCase( 'organization' ) ).toBe( 'organization' );
		expect( snakeCase( 'first_name' ) ).toBe( 'first_name' );
	} );

	it( 'is scoped to ASCII — accents are not deburred like lodash', () => {
		// lodash snakeCase( 'déjà-vu' ) is 'deja_vu'; these helpers tokenize ASCII only.
		expect( snakeCase( 'déjà-vu' ) ).toBe( 'd_j_vu' );
	} );

	it( 'returns an empty string for nullish input', () => {
		expect( snakeCase( null ) ).toBe( '' );
		expect( snakeCase( undefined ) ).toBe( '' );
		expect( snakeCase( '' ) ).toBe( '' );
	} );
} );
