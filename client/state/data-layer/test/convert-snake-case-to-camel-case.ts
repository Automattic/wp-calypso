import { convertSnakeCaseToCamelCase } from '../convert-snake-case-to-camel-case';

describe( 'convertSnakeCaseToCamelCase', () => {
	it( 'should convert snake_case to camelCase', () => {
		const foo = convertSnakeCaseToCamelCase( {
			is_disabled: true,
			isEnabled: true,
		} );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.is_disabled ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
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

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.is_disabled ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
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

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.is_disabled ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.isDisabled[ 0 ].first_name ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.isDisabled[ 0 ].firstName.second_name ).toBeUndefined();

		expect( foo.isDisabled ).toBeDefined();
		expect( foo.isDisabled[ 0 ].firstName ).toBeDefined();
		expect( foo.isDisabled[ 0 ].firstName.secondName ).toBe( true );
	} );

	it( 'should handle arrays of primitives', () => {
		const foo = convertSnakeCaseToCamelCase( {
			numbers_list: [ 1, 2, 3 ],
		} );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
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

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.level_one ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.levelOne.level_two ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
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

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.string_value ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.number_value ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.boolean_value ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.array_value ).toBeUndefined();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		expect( foo.nested_object ).toBeUndefined();

		expect( foo.stringValue ).toBe( 'hello' );
		expect( foo.numberValue ).toBe( 123 );
		expect( foo.booleanValue ).toBe( true );
		expect( foo.arrayValue[ 0 ].nestedKey ).toBe( 'value' );
		expect( foo.nestedObject.anotherKey ).toBe( 'another value' );
	} );
} );
