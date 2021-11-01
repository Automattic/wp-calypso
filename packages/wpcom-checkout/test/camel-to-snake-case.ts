import { camelToSnakeCase } from '../src/camel-to-snake-case';

describe( 'camelToSnakeCase', () => {
	it( 'transforms camelCase to snake_case for strings with two words', () => {
		expect( camelToSnakeCase( 'camelCase' ) ).toBe( 'camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings with four words', () => {
		expect( camelToSnakeCase( 'thisIsCamelCase' ) ).toBe( 'this_is_camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings with a number', () => {
		expect( camelToSnakeCase( 'camelCase1' ) ).toBe( 'camel_case_1' );
	} );

	it( 'transforms camelCase to snake_case for strings with a number_followed by a capital', () => {
		expect( camelToSnakeCase( 'camelCase1Hi' ) ).toBe( 'camel_case_1_hi' );
	} );

	it( 'transforms camelCase to snake_case for strings with a number_followed by a lowercase', () => {
		expect( camelToSnakeCase( 'camelCase1hi' ) ).toBe( 'camel_case_1_hi' );
	} );

	it( 'transforms camelCase to snake_case for strings with multiple adjacent numbers', () => {
		expect( camelToSnakeCase( 'hello1234Thing' ) ).toBe( 'hello_1234_thing' );
	} );

	it( 'transforms camelCase to snake_case for strings with an existing underscore', () => {
		expect( camelToSnakeCase( 'camelCase_word' ) ).toBe( 'camel_case_word' );
	} );

	it( 'transforms camelCase to snake_case for strings with a capitalized first letter', () => {
		expect( camelToSnakeCase( 'CamelCase' ) ).toBe( 'camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings with a space', () => {
		expect( camelToSnakeCase( 'camel case' ) ).toBe( 'camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings that start with a space', () => {
		expect( camelToSnakeCase( ' camel case' ) ).toBe( 'camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings that start with an underscore', () => {
		expect( camelToSnakeCase( '_camel_case' ) ).toBe( 'camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings that end with a space', () => {
		expect( camelToSnakeCase( 'camel case ' ) ).toBe( 'camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings that end with an underscore', () => {
		expect( camelToSnakeCase( 'camel_case_' ) ).toBe( 'camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings with multiple adjacent spaces', () => {
		expect( camelToSnakeCase( 'camel  case' ) ).toBe( 'camel_case' );
	} );

	it( 'transforms camelCase to snake_case for strings with multiple adjacent capitals', () => {
		expect( camelToSnakeCase( 'helloWORLDThing' ) ).toBe( 'hello_world_thing' );
	} );
} );
