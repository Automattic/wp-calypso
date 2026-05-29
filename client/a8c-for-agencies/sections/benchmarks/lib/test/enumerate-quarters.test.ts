import { enumerateQuarters } from '../enumerate-quarters';

describe( 'enumerateQuarters', () => {
	it( 'enumerates a same-year range newest-first', () => {
		expect( enumerateQuarters( { quarter: 1, year: 2026 }, { quarter: 4, year: 2026 } ) ).toEqual( [
			{ quarter: 4, year: 2026 },
			{ quarter: 3, year: 2026 },
			{ quarter: 2, year: 2026 },
			{ quarter: 1, year: 2026 },
		] );
	} );

	it( 'enumerates a multi-year range across the year boundary', () => {
		expect( enumerateQuarters( { quarter: 3, year: 2025 }, { quarter: 2, year: 2026 } ) ).toEqual( [
			{ quarter: 2, year: 2026 },
			{ quarter: 1, year: 2026 },
			{ quarter: 4, year: 2025 },
			{ quarter: 3, year: 2025 },
		] );
	} );

	it( 'returns a single quarter when earliest equals latest', () => {
		expect( enumerateQuarters( { quarter: 2, year: 2026 }, { quarter: 2, year: 2026 } ) ).toEqual( [
			{ quarter: 2, year: 2026 },
		] );
	} );

	it( 'falls back to just the latest quarter when the range is inverted', () => {
		expect( enumerateQuarters( { quarter: 4, year: 2026 }, { quarter: 1, year: 2026 } ) ).toEqual( [
			{ quarter: 1, year: 2026 },
		] );
	} );
} );
