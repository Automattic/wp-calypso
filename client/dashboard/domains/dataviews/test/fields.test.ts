import { sortNullableStrings } from '../sort-nullable-strings';

describe( 'sortNullableStrings', () => {
	it( 'returns 0 when both values are null', () => {
		expect( sortNullableStrings( null, null, 'asc' ) ).toBe( 0 );
	} );

	it( 'returns 0 when both values are undefined', () => {
		expect( sortNullableStrings( undefined, undefined, 'asc' ) ).toBe( 0 );
	} );

	it( 'sorts null values to the end', () => {
		expect( sortNullableStrings( null, '2-next-90-days', 'asc' ) ).toBe( 1 );
		expect( sortNullableStrings( '2-next-90-days', null, 'asc' ) ).toBe( -1 );
	} );

	it( 'sorts undefined values to the end', () => {
		expect( sortNullableStrings( undefined, '2-next-90-days', 'asc' ) ).toBe( 1 );
		expect( sortNullableStrings( '2-next-90-days', undefined, 'asc' ) ).toBe( -1 );
	} );

	it( 'sorts strings ascending', () => {
		expect( sortNullableStrings( '1-expired', '2-next-90-days', 'asc' ) ).toBeLessThan( 0 );
		expect( sortNullableStrings( '2-next-90-days', '3-more-than-90-days', 'asc' ) ).toBeLessThan(
			0
		);
	} );

	it( 'sorts strings descending', () => {
		expect( sortNullableStrings( '1-expired', '2-next-90-days', 'desc' ) ).toBeGreaterThan( 0 );
		expect(
			sortNullableStrings( '2-next-90-days', '3-more-than-90-days', 'desc' )
		).toBeGreaterThan( 0 );
	} );

	it( 'returns 0 for equal values', () => {
		expect( sortNullableStrings( '1-expired', '1-expired', 'asc' ) ).toBe( 0 );
	} );
} );
