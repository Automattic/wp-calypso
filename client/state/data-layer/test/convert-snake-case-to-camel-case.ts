import { convertSnakeCaseToCamelCase } from '../convert-snake-case-to-camel-case';

describe( 'convertSnakeCaseToCamelCase', () => {
	it( 'should convert snake_case to camelCase', () => {
		const foo = convertSnakeCaseToCamelCase( {
			is_disabled: true,
			isEnabled: true,
		} );

		// @ts-expect-error Property 'is_disabled' does not exist on type '{ isDisabled: boolean; isEnabled: boolean; }'.
		expect( foo.is_disabled ).toBeUndefined();
		// @ts-expect-error Property 'qqq' does not exist on type '{ isDisabled: boolean; isEnabled: boolean; }'.
		expect( foo.qqq ).toBeUndefined();

		expect( foo.isDisabled ).toBe( true );
		expect( foo.isEnabled ).toBe( true );
	} );

	it( 'should convert nested snake_case to camelCase', () => {
		const foo = convertSnakeCaseToCamelCase( {
			is_disabled: {
				first_name: true,
			},
		} );

		// @ts-expect-error Property 'is_disabled' does not exist on type '{ isDisabled: { firstName: boolean; }; }'.
		expect( foo.is_disabled ).toBeUndefined();
		// @ts-expect-error Property 'isDisabled.first_name' does not exist on type '{ isDisabled: { firstName: boolean; }; }'.
		expect( foo.isDisabled.first_name ).toBeUndefined();

		expect( foo.isDisabled ).toBeDefined();
		expect( foo.isDisabled.firstName ).toBe( true );
	} );

	it( 'should convert array of nested snake_case to camelCase', () => {
		const foo = convertSnakeCaseToCamelCase( {
			is_disabled: [
				{
					first_name: {
						second_name: true,
					},
				},
			],
		} );

		// @ts-expect-error Property 'is_disabled' does not exist on type '{ isDisabled: { firstName: { secondName: boolean; }; }[]; }'.
		expect( foo.is_disabled ).toBeUndefined();
		// @ts-expect-error Property 'isDisabled[0].first_name' does not exist on type '{ isDisabled: { firstName: { secondName: boolean; }; }[]; }'.
		expect( foo.isDisabled[ 0 ].first_name ).toBeUndefined();
		// @ts-expect-error Property 'isDisabled[0].firstName.second_name' does not exist on type '{ isDisabled: { firstName: { secondName: boolean; }; }[]; }'.
		expect( foo.isDisabled[ 0 ].firstName.second_name ).toBeUndefined();

		expect( foo.isDisabled ).toBeDefined();
		expect( foo.isDisabled[ 0 ].firstName ).toBeDefined();
		expect( foo.isDisabled[ 0 ].firstName.secondName ).toBe( true );
	} );

	it( 'should handle arrays of primitives', () => {
		const foo = convertSnakeCaseToCamelCase( {
			numbers_list: [ 1, 2, 3 ],
		} );

		// @ts-expect-error Property 'numbers_list' does not exist on type '{ numbersList: number[]; }'.
		expect( foo.numbers_list ).toBeUndefined();

		expect( foo.numbersList ).toEqual( [ 1, 2, 3 ] );
	} );

	it( 'should handle deeply nested structures', () => {
		const foo = convertSnakeCaseToCamelCase( {
			level_one: {
				level_two: {
					level_three: {
						some_value: 'test',
					},
				},
			},
		} );

		// @ts-expect-error Property 'level_one' does not exist on type '{ levelOne: { levelTwo: { levelThree: { someValue: string; }; }; }'.
		expect( foo.level_one ).toBeUndefined();
		// @ts-expect-error Property 'levelOne.level_two' does not exist on type '{ levelOne: { levelTwo: { levelThree: { someValue: string; }; }; }'.
		expect( foo.levelOne.level_two ).toBeUndefined();
		// @ts-expect-error Property 'levelOne.levelTwo.level_three' does not exist on type '{ levelOne: { levelTwo: { levelThree: { someValue: string; }; }; }'.
		expect( foo.levelOne.levelTwo.level_three ).toBeUndefined();

		expect( foo.levelOne ).toBeDefined();
		expect( foo.levelOne.levelTwo ).toBeDefined();
		expect( foo.levelOne.levelTwo.levelThree ).toBeDefined();
		expect( foo.levelOne.levelTwo.levelThree.someValue ).toBe( 'test' );
	} );

	it( 'should handle objects with mixed types', () => {
		const foo = convertSnakeCaseToCamelCase( {
			string_value: 'hello',
			number_value: 123,
			boolean_value: true,
			array_value: [ { nested_key: 'value' } ],
			nested_object: {
				another_key: 'another value',
			},
		} );

		// @ts-expect-error Property 'string_value' does not exist on type '{ stringValue: string; numberValue: number; booleanValue: boolean; arrayValue: { nestedKey: string; }[]; nestedObject: { anotherKey: string; }; }'.
		expect( foo.string_value ).toBeUndefined();
		// @ts-expect-error Property 'number_value' does not exist on type '{ stringValue: string; numberValue: number; booleanValue: boolean; arrayValue: { nestedKey: string; }[]; nestedObject: { anotherKey: string; }; }'.
		expect( foo.number_value ).toBeUndefined();
		// @ts-expect-error Property 'boolean_value' does not exist on type '{ stringValue: string; numberValue: number; booleanValue: boolean; arrayValue: { nestedKey: string; }[]; nestedObject: { anotherKey: string; }; }'.
		expect( foo.boolean_value ).toBeUndefined();
		// @ts-expect-error Property 'array_value' does not exist on type '{ stringValue: string; numberValue: number; booleanValue: boolean; arrayValue: { nestedKey: string; }[]; nestedObject: { anotherKey: string; }; }'.
		expect( foo.array_value ).toBeUndefined();
		// @ts-expect-error Property 'nested_object' does not exist on type '{ stringValue: string; numberValue: number; booleanValue: boolean; arrayValue: { nestedKey: string; }[]; nestedObject: { anotherKey: string; }; }'.
		expect( foo.nested_object ).toBeUndefined();

		expect( foo.stringValue ).toBe( 'hello' );
		expect( foo.numberValue ).toBe( 123 );
		expect( foo.booleanValue ).toBe( true );
		expect( foo.arrayValue[ 0 ].nestedKey ).toBe( 'value' );
		expect( foo.nestedObject.anotherKey ).toBe( 'another value' );
	} );
} );
