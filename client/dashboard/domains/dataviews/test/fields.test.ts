import { sortNullableDates, sortNullableStrings } from '../sort-nullable-strings';

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

describe( 'sortNullableDates', () => {
	it( 'returns 0 when both values are null', () => {
		expect( sortNullableDates( null, null, 'asc' ) ).toBe( 0 );
	} );

	it( 'returns 0 when both values are undefined', () => {
		expect( sortNullableDates( undefined, undefined, 'asc' ) ).toBe( 0 );
	} );

	it( 'sorts null values to the end', () => {
		expect( sortNullableDates( null, '2025-06-15', 'asc' ) ).toBeGreaterThan( 0 );
		expect( sortNullableDates( '2025-06-15', null, 'asc' ) ).toBeLessThan( 0 );
	} );

	it( 'sorts null values to the end regardless of direction', () => {
		expect( sortNullableDates( null, '2025-06-15', 'desc' ) ).toBeGreaterThan( 0 );
		expect( sortNullableDates( '2025-06-15', null, 'desc' ) ).toBeLessThan( 0 );
	} );

	it( 'sorts dates ascending', () => {
		expect( sortNullableDates( '2025-06-15', '2025-12-31', 'asc' ) ).toBeLessThan( 0 );
		expect( sortNullableDates( '2025-12-31', '2026-06-15', 'asc' ) ).toBeLessThan( 0 );
	} );

	it( 'sorts dates descending', () => {
		expect( sortNullableDates( '2025-06-15', '2025-12-31', 'desc' ) ).toBeGreaterThan( 0 );
		expect( sortNullableDates( '2025-12-31', '2026-06-15', 'desc' ) ).toBeGreaterThan( 0 );
	} );

	it( 'returns 0 for equal dates', () => {
		expect( sortNullableDates( '2025-06-15', '2025-06-15', 'asc' ) ).toBe( 0 );
	} );
} );
