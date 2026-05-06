import getMostRecentPastQuarter from '../get-most-recent-past-quarter';

describe( 'getMostRecentPastQuarter', () => {
	it( 'returns Q4 of the previous year on Jan 1 UTC', () => {
		expect( getMostRecentPastQuarter( new Date( Date.UTC( 2026, 0, 1 ) ) ) ).toEqual( {
			quarter: 4,
			year: 2025,
		} );
	} );

	it( 'returns Q4 of the previous year through end of March UTC', () => {
		expect( getMostRecentPastQuarter( new Date( Date.UTC( 2026, 2, 31, 23, 59 ) ) ) ).toEqual( {
			quarter: 4,
			year: 2025,
		} );
	} );

	it( 'returns Q1 same year on Apr 1 UTC', () => {
		expect( getMostRecentPastQuarter( new Date( Date.UTC( 2026, 3, 1 ) ) ) ).toEqual( {
			quarter: 1,
			year: 2026,
		} );
	} );

	it( 'returns Q2 same year in mid-Q3', () => {
		expect( getMostRecentPastQuarter( new Date( Date.UTC( 2026, 7, 15 ) ) ) ).toEqual( {
			quarter: 2,
			year: 2026,
		} );
	} );

	it( 'returns Q3 same year on Oct 1 UTC', () => {
		expect( getMostRecentPastQuarter( new Date( Date.UTC( 2026, 9, 1 ) ) ) ).toEqual( {
			quarter: 3,
			year: 2026,
		} );
	} );

	it( 'returns Q3 same year through end of December UTC', () => {
		expect( getMostRecentPastQuarter( new Date( Date.UTC( 2026, 11, 31, 23, 59 ) ) ) ).toEqual( {
			quarter: 3,
			year: 2026,
		} );
	} );
} );
