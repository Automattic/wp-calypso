import snakeToCamelCase from '../snake-to-camel-case';

describe( 'snakeToCamelCase', () => {
	it( 'transforms snake_case to camelCase for strings with two words', () => {
		expect( snakeToCamelCase( 'camel_case' ) ).toBe( 'camelCase' );
	} );

	it( 'transforms snake_case to camelCase for strings with four words', () => {
		expect( snakeToCamelCase( 'this_is_camel_case' ) ).toBe( 'thisIsCamelCase' );
	} );

	it( 'transforms snake_case to camelCase for strings with a number', () => {
		expect( snakeToCamelCase( 'camel_case_1' ) ).toBe( 'camelCase1' );
	} );

	it( 'transforms snake_case to camelCase for strings with a number_followed by a capital', () => {
		expect( snakeToCamelCase( 'camel_case_1_hi' ) ).toBe( 'camelCase1Hi' );
	} );

	it( 'transforms snake_case to camelCase for strings with multiple adjacent numbers', () => {
		expect( snakeToCamelCase( 'hello_1234_thing' ) ).toBe( 'hello1234Thing' );
	} );
} );
