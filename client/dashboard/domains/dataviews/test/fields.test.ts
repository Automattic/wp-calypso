import { sortByExpiry } from '../sort-by-expiry';

describe( 'sortByExpiry', () => {
	it( 'returns 0 when both values are null', () => {
		expect( sortByExpiry( null, null, 'asc' ) ).toBe( 0 );
	} );

	it( 'returns 0 when both values are undefined', () => {
		expect( sortByExpiry( undefined, undefined, 'asc' ) ).toBe( 0 );
	} );

	it( 'sorts null values to the end', () => {
		expect( sortByExpiry( null, '2-next-90-days', 'asc' ) ).toBe( 1 );
		expect( sortByExpiry( '2-next-90-days', null, 'asc' ) ).toBe( -1 );
	} );

	it( 'sorts undefined values to the end', () => {
		expect( sortByExpiry( undefined, '2-next-90-days', 'asc' ) ).toBe( 1 );
		expect( sortByExpiry( '2-next-90-days', undefined, 'asc' ) ).toBe( -1 );
	} );

	it( 'sorts expiry categories ascending', () => {
		expect( sortByExpiry( '1-expired', '2-next-90-days', 'asc' ) ).toBeLessThan( 0 );
		expect( sortByExpiry( '2-next-90-days', '3-more-than-90-days', 'asc' ) ).toBeLessThan( 0 );
	} );

	it( 'sorts expiry categories descending', () => {
		expect( sortByExpiry( '1-expired', '2-next-90-days', 'desc' ) ).toBeGreaterThan( 0 );
		expect( sortByExpiry( '2-next-90-days', '3-more-than-90-days', 'desc' ) ).toBeGreaterThan( 0 );
	} );

	it( 'returns 0 for equal values', () => {
		expect( sortByExpiry( '1-expired', '1-expired', 'asc' ) ).toBe( 0 );
	} );
} );
