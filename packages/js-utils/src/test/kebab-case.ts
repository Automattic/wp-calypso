import kebabCase from '../kebab-case';

describe( 'kebabCase', () => {
	it( 'converts camel, snake, and spaced input to kebab-case', () => {
		expect( kebabCase( 'fooBar' ) ).toBe( 'foo-bar' );
		expect( kebabCase( 'foo_bar' ) ).toBe( 'foo-bar' );
		expect( kebabCase( 'Foo Bar' ) ).toBe( 'foo-bar' );
	} );

	it( 'maps camelCase and snake_case to the same kebab key', () => {
		expect( kebabCase( 'primitiveValue' ) ).toBe( 'primitive-value' );
		expect( kebabCase( 'primitive_value' ) ).toBe( 'primitive-value' );
	} );

	it( 'splits Pascal acronym and numeric boundaries like lodash', () => {
		expect( kebabCase( 'QuotaExceededError' ) ).toBe( 'quota-exceeded-error' );
		expect( kebabCase( 'postalCode' ) ).toBe( 'postal-code' );
		expect( kebabCase( 'address1' ) ).toBe( 'address-1' );
	} );

	it( 'is scoped to ASCII — accents are not deburred like lodash', () => {
		// lodash kebabCase( 'déjà-vu' ) is 'deja-vu'; these helpers tokenize ASCII only.
		expect( kebabCase( 'déjà-vu' ) ).toBe( 'd-j-vu' );
	} );

	it( 'returns an empty string for nullish input', () => {
		expect( kebabCase( null ) ).toBe( '' );
		expect( kebabCase( undefined ) ).toBe( '' );
		expect( kebabCase( '' ) ).toBe( '' );
	} );
} );
