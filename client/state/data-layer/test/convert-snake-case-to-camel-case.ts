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
		expect( foo.isDisabled[ 0 ].first_name.second_name ).toBeUndefined();

		expect( foo.isDisabled ).toBeDefined();
		expect( foo.isDisabled[ 0 ].firstName ).toBeDefined();
		expect( foo.isDisabled[ 0 ].firstName.secondName ).toBe( true );
	} );
} );
