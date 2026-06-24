import getSubmissionDeadline from '../get-submission-deadline';

describe( 'getSubmissionDeadline', () => {
	it( 'returns April 30 for Q1', () => {
		expect( getSubmissionDeadline( { quarter: 1, year: 2026 } ) ).toEqual(
			new Date( Date.UTC( 2026, 3, 30 ) )
		);
	} );

	it( 'returns July 31 for Q2', () => {
		expect( getSubmissionDeadline( { quarter: 2, year: 2026 } ) ).toEqual(
			new Date( Date.UTC( 2026, 6, 31 ) )
		);
	} );

	it( 'returns October 31 for Q3', () => {
		expect( getSubmissionDeadline( { quarter: 3, year: 2026 } ) ).toEqual(
			new Date( Date.UTC( 2026, 9, 31 ) )
		);
	} );

	it( 'returns January 31 of the following year for Q4', () => {
		expect( getSubmissionDeadline( { quarter: 4, year: 2025 } ) ).toEqual(
			new Date( Date.UTC( 2026, 0, 31 ) )
		);
	} );

	it( 'rolls Q4 over the year boundary at the turn of the millennium', () => {
		expect( getSubmissionDeadline( { quarter: 4, year: 1999 } ) ).toEqual(
			new Date( Date.UTC( 2000, 0, 31 ) )
		);
	} );

	it( 'returns April 30 for Q1 in a leap year (no impact)', () => {
		expect( getSubmissionDeadline( { quarter: 1, year: 2024 } ) ).toEqual(
			new Date( Date.UTC( 2024, 3, 30 ) )
		);
	} );
} );
