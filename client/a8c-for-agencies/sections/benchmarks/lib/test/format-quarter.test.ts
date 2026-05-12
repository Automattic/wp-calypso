import { formatQuarterShort } from '../format-quarter';

describe( 'formatQuarterShort', () => {
	it( 'formats year as a two-digit suffix', () => {
		expect( formatQuarterShort( { quarter: 3, year: 2024 } ) ).toBe( 'Q3 24' );
		expect( formatQuarterShort( { quarter: 1, year: 2026 } ) ).toBe( 'Q1 26' );
	} );

	it( 'pads sub-decade years to two digits', () => {
		expect( formatQuarterShort( { quarter: 4, year: 2008 } ) ).toBe( 'Q4 08' );
	} );

	it( 'wraps the year-2100 boundary as expected', () => {
		expect( formatQuarterShort( { quarter: 2, year: 2100 } ) ).toBe( 'Q2 00' );
	} );
} );
