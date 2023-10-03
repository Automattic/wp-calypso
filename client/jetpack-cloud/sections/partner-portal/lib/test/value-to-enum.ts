import valueToEnum from '../value-to-enum';

enum TestEnum {
	Value1 = 'Lions',
	Value2 = 'Tigers',
	Value3 = 'Bears',
	Value4 = 'George Takei',
}

describe( 'valueToEnum', () => {
	it( 'returns the appropriate enum value if one is found', () => {
		const result = valueToEnum( TestEnum, 'Tigers', TestEnum.Value4 );
		expect( result ).toBe( TestEnum.Value2 );
	} );

	it( 'returns the supplied fallback value if an enum value is not found', () => {
		const result = valueToEnum( TestEnum, 'The Spanish Inquisition', TestEnum.Value4 );
		expect( result ).toBe( TestEnum.Value4 );
	} );
} );
