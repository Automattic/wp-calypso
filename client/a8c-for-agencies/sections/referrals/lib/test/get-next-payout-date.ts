import { getNextPayoutDate } from '../get-next-payout-date';

describe( 'getNextPayoutDate', () => {
	it( 'should return June 1st for Q1 dates', () => {
		const result = getNextPayoutDate( new Date( '2024-02-15' ) );
		expect( result ).toEqual( new Date( '2024-06-01' ) );
	} );

	it( 'should return September 1st for Q2 dates', () => {
		const result = getNextPayoutDate( new Date( '2024-05-15' ) );
		expect( result ).toEqual( new Date( '2024-09-01' ) );
	} );
	it( 'should return December 1st for Q3 dates', () => {
		const result = getNextPayoutDate( new Date( '2024-08-15' ) );
		expect( result ).toEqual( new Date( '2024-12-01' ) );
	} );

	it( 'should return March 1st of next year for Q4 dates', () => {
		const result = getNextPayoutDate( new Date( '2024-11-15' ) );
		expect( result ).toEqual( new Date( '2025-03-01' ) );
	} );

	it( 'should handle quarter boundaries correctly', () => {
		// Test first day of Q1
		let result = getNextPayoutDate( new Date( '2024-01-01' ) );
		expect( result ).toEqual( new Date( '2024-06-01' ) );

		// Test last day of Q4
		result = getNextPayoutDate( new Date( '2024-12-31' ) );
		expect( result ).toEqual( new Date( '2025-03-01' ) );
	} );
} );
