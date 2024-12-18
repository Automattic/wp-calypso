import { getNextPayoutDate, getNextPayoutDateActivityWindow } from '../get-next-payout-date';

describe( 'get-next-payout-date', () => {
	describe( 'getNextPayoutDate', () => {
		it( 'should return March 2nd for dates before March 2nd', () => {
			const result = getNextPayoutDate( new Date( '2024-02-15' ) );
			expect( result ).toEqual( new Date( '2024-03-02' ) );
		} );

		it( 'should return June 1st for dates between March 1st and June 1st', () => {
			const result = getNextPayoutDate( new Date( '2024-04-15' ) );
			expect( result ).toEqual( new Date( '2024-06-01' ) );
		} );

		it( 'should return September 1st for dates between June 1st and September 1st', () => {
			const result = getNextPayoutDate( new Date( '2024-07-15' ) );
			expect( result ).toEqual( new Date( '2024-09-01' ) );
		} );

		it( 'should return December 1st for dates between September 1st and December 1st', () => {
			const result = getNextPayoutDate( new Date( '2024-10-15' ) );
			expect( result ).toEqual( new Date( '2024-12-01' ) );
		} );

		it( 'should return March 2nd of next year for dates after December 1st', () => {
			const result = getNextPayoutDate( new Date( '2024-12-15' ) );
			expect( result ).toEqual( new Date( '2025-03-02' ) );
		} );
		it( 'should return March 2nd of next year for dates on December 1st', () => {
			const result = getNextPayoutDate( new Date( '2024-12-01' ) );
			expect( result ).toEqual( new Date( '2025-03-02' ) );
		} );

		it( 'should handle exact payout dates correctly', () => {
			// On March 1st, next payout is March 2nd
			let result = getNextPayoutDate( new Date( '2024-03-01' ) );
			expect( result ).toEqual( new Date( '2024-03-02' ) );

			// On March 2nd, next payout is June 1st
			result = getNextPayoutDate( new Date( '2024-03-02' ) );
			expect( result ).toEqual( new Date( '2024-06-01' ) );

			// On December 1st, next payout is March 2nd of next year
			result = getNextPayoutDate( new Date( '2024-12-01' ) );
			expect( result ).toEqual( new Date( '2025-03-02' ) );
		} );
	} );

	describe( 'getNextPayoutDateActivityWindow', () => {
		it( 'should return Q4 activity window for dates before March 2nd', () => {
			const result = getNextPayoutDateActivityWindow( new Date( '2024-02-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2023-10-01' ),
				finish: new Date( '2023-12-31' ),
			} );
		} );

		it( 'should return Q1 activity window for dates between March 2nd and June 1st', () => {
			const result = getNextPayoutDateActivityWindow( new Date( '2024-04-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-01-01' ),
				finish: new Date( '2024-03-31' ),
			} );
		} );

		it( 'should return Q2 activity window for dates between June 1st and September 1st', () => {
			const result = getNextPayoutDateActivityWindow( new Date( '2024-07-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-04-01' ),
				finish: new Date( '2024-06-30' ),
			} );
		} );

		it( 'should return Q3 activity window for dates between September 1st and December 1st', () => {
			const result = getNextPayoutDateActivityWindow( new Date( '2024-10-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-07-01' ),
				finish: new Date( '2024-09-30' ),
			} );
		} );

		it( 'should return Q4 activity window for dates after December 1st', () => {
			const result = getNextPayoutDateActivityWindow( new Date( '2023-12-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2023-10-01' ),
				finish: new Date( '2023-12-31' ),
			} );
		} );

		it( 'should handle exact payout dates correctly', () => {
			// On March 1st, next payout is March 2nd, so Q4 activity
			let result = getNextPayoutDateActivityWindow( new Date( '2024-03-01' ) );
			expect( result ).toEqual( {
				start: new Date( '2023-10-01' ),
				finish: new Date( '2023-12-31' ),
			} );

			// On March 2nd, next payout is June 1st, so Q1 activity
			result = getNextPayoutDateActivityWindow( new Date( '2024-03-02' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-01-01' ),
				finish: new Date( '2024-03-31' ),
			} );

			// On December 1st, next payout is March 2nd of next year, so Q4 activity
			result = getNextPayoutDateActivityWindow( new Date( '2023-12-01' ) );
			expect( result ).toEqual( {
				start: new Date( '2023-10-01' ),
				finish: new Date( '2023-12-31' ),
			} );
		} );
	} );
} );
