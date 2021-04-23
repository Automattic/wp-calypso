/**
 * Internal dependencies
 */
import { snakeCase } from '../src/snake-case';

describe( 'snakeCase', () => {
	it( 'converts camelCase to snake_case, but leaves snake_case alone', () => {
		const foo = { camelCaseWord: 'moo', snake_case: 'boo' };
		const expected = { camel_case_word: 'moo', snake_case: 'boo' };
		expect( snakeCase( foo ) ).toEqual( expected );
	} );

	it( 'lowercases keys that start with a capital letter', () => {
		const foo = { CamelCase: 'moo', snake_case: 'boo' };
		const expected = { camel_case: 'moo', snake_case: 'boo' };
		expect( snakeCase( foo ) ).toEqual( expected );
	} );

	it( 'does not add underscores to keys that contain underscores already even if they have capital letters', () => {
		const foo = { Camel_CaseWord: 'moo', snake_case: 'boo' };
		const expected = { camel_caseword: 'moo', snake_case: 'boo' };
		expect( snakeCase( foo ) ).toEqual( expected );
	} );

	it( 'overwrites camelCase keys with snake_case ones if they overlap', () => {
		let foo = { camelCase: 'moo', camel_case: 'boo' };
		let expected = { camel_case: 'boo' };
		expect( snakeCase( foo ) ).toEqual( expected );

		// Just in case order matters, do it both ways
		foo = { camel_case: 'moo', camelCase: 'boo' };
		expected = { camel_case: 'moo' };
		expect( snakeCase( foo ) ).toEqual( expected );
	} );
} );
