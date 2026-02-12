import { sortByExpiry } from '../sort-by-expiry';

describe( 'sortByExpiry', () => {
	it( 'returns 0 when both expiry values are null', () => {
		expect( sortByExpiry( { expiry: null }, { expiry: null }, 'asc' ) ).toBe( 0 );
	} );

	it( 'returns 0 when both expiry values are undefined', () => {
		expect(
			sortByExpiry(
				{ expiry: undefined as unknown as null },
				{ expiry: undefined as unknown as null },
				'asc'
			)
		).toBe( 0 );
	} );

	it( 'sorts items with null expiry to the end', () => {
		expect( sortByExpiry( { expiry: null }, { expiry: '2025-01-01' }, 'asc' ) ).toBe( 1 );
		expect( sortByExpiry( { expiry: '2025-01-01' }, { expiry: null }, 'asc' ) ).toBe( -1 );
	} );

	it( 'sorts items with undefined expiry to the end', () => {
		expect(
			sortByExpiry( { expiry: undefined as unknown as null }, { expiry: '2025-01-01' }, 'asc' )
		).toBe( 1 );
		expect(
			sortByExpiry( { expiry: '2025-01-01' }, { expiry: undefined as unknown as null }, 'asc' )
		).toBe( -1 );
	} );

	it( 'sorts dates ascending', () => {
		const result = sortByExpiry( { expiry: '2025-01-01' }, { expiry: '2026-01-01' }, 'asc' );
		expect( result ).toBeLessThan( 0 );
	} );

	it( 'sorts dates descending', () => {
		const result = sortByExpiry( { expiry: '2025-01-01' }, { expiry: '2026-01-01' }, 'desc' );
		expect( result ).toBeGreaterThan( 0 );
	} );

	it( 'returns 0 for equal dates', () => {
		expect( sortByExpiry( { expiry: '2025-06-15' }, { expiry: '2025-06-15' }, 'asc' ) ).toBe( 0 );
	} );
} );
