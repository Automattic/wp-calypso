import {
	getNextPayoutDate,
	getNextPayoutDateActivityWindow,
	getCurrentCyclePayoutDate,
	getCurrentCycleActivityWindow,
} from '../get-next-payout-date';

describe( 'get-next-payout-date', () => {
	describe( 'getNextPayoutDate', () => {
		it( 'should return March 2nd for dates before March 2nd', () => {
			const result = getNextPayoutDate( new Date( '2024-02-15' ) );
			expect( result ).toEqual( new Date( '2024-03-02' ) );
		} );

		it( 'should return June 1st for dates between March 2nd and June 1st', () => {
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

			// On June 1st, next payout is September 1st
			result = getNextPayoutDate( new Date( '2024-06-01' ) );
			expect( result ).toEqual( new Date( '2024-09-01' ) );

			// On September 1st, next payout is December 1st
			result = getNextPayoutDate( new Date( '2024-09-01' ) );
			expect( result ).toEqual( new Date( '2024-12-01' ) );

			// On December 1st, next payout is March 2nd of next year
			result = getNextPayoutDate( new Date( '2024-12-01' ) );
			expect( result ).toEqual( new Date( '2025-03-02' ) );
		} );

		it( 'should handle year transitions correctly', () => {
			// January should return March 2nd of same year
			const result = getNextPayoutDate( new Date( '2024-01-15' ) );
			expect( result ).toEqual( new Date( '2024-03-02' ) );

			// Late December should return March 2nd of next year
			const result2 = getNextPayoutDate( new Date( '2024-12-31' ) );
			expect( result2 ).toEqual( new Date( '2025-03-02' ) );
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
			const result = getNextPayoutDateActivityWindow( new Date( '2024-12-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-10-01' ),
				finish: new Date( '2024-12-31' ),
			} );
		} );

		it( 'should handle exact payout dates correctly', () => {
			// On March 1st, next payout is March 2nd, so Q4 activity of previous year
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

			// On December 1st, next payout is March 2nd of next year, so Q4 activity of current year
			result = getNextPayoutDateActivityWindow( new Date( '2024-12-01' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-10-01' ),
				finish: new Date( '2024-12-31' ),
			} );
		} );
	} );

	describe( 'getCurrentCyclePayoutDate', () => {
		it( 'should return March 2nd for dates in Q4 activity period (Oct-Dec)', () => {
			// October
			let result = getCurrentCyclePayoutDate( new Date( '2024-10-15' ) );
			expect( result ).toEqual( new Date( '2025-03-02' ) );

			// November
			result = getCurrentCyclePayoutDate( new Date( '2024-11-15' ) );
			expect( result ).toEqual( new Date( '2025-03-02' ) );

			// December
			result = getCurrentCyclePayoutDate( new Date( '2024-12-15' ) );
			expect( result ).toEqual( new Date( '2025-03-02' ) );
		} );

		it( 'should return June 1st for dates in Q1 activity period (Jan-Mar)', () => {
			// January
			let result = getCurrentCyclePayoutDate( new Date( '2024-01-15' ) );
			expect( result ).toEqual( new Date( '2024-06-01' ) );

			// February
			result = getCurrentCyclePayoutDate( new Date( '2024-02-15' ) );
			expect( result ).toEqual( new Date( '2024-06-01' ) );

			// March
			result = getCurrentCyclePayoutDate( new Date( '2024-03-15' ) );
			expect( result ).toEqual( new Date( '2024-06-01' ) );
		} );

		it( 'should return September 1st for dates in Q2 activity period (Apr-Jun)', () => {
			// April
			let result = getCurrentCyclePayoutDate( new Date( '2024-04-15' ) );
			expect( result ).toEqual( new Date( '2024-09-01' ) );

			// May
			result = getCurrentCyclePayoutDate( new Date( '2024-05-15' ) );
			expect( result ).toEqual( new Date( '2024-09-01' ) );

			// June
			result = getCurrentCyclePayoutDate( new Date( '2024-06-15' ) );
			expect( result ).toEqual( new Date( '2024-09-01' ) );
		} );

		it( 'should return December 1st for dates in Q3 activity period (Jul-Sep)', () => {
			// July
			let result = getCurrentCyclePayoutDate( new Date( '2024-07-15' ) );
			expect( result ).toEqual( new Date( '2024-12-01' ) );

			// August
			result = getCurrentCyclePayoutDate( new Date( '2024-08-15' ) );
			expect( result ).toEqual( new Date( '2024-12-01' ) );

			// September
			result = getCurrentCyclePayoutDate( new Date( '2024-09-15' ) );
			expect( result ).toEqual( new Date( '2024-12-01' ) );
		} );
	} );

	describe( 'getCurrentCycleActivityWindow', () => {
		it( 'should return Q4 activity window for dates in Q4 period (Oct-Dec)', () => {
			const result = getCurrentCycleActivityWindow( new Date( '2024-10-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-10-01' ),
				finish: new Date( '2024-12-31' ),
			} );
		} );

		it( 'should return Q1 activity window for dates in Q1 period (Jan-Mar)', () => {
			const result = getCurrentCycleActivityWindow( new Date( '2024-02-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-01-01' ),
				finish: new Date( '2024-03-31' ),
			} );
		} );

		it( 'should return Q2 activity window for dates in Q2 period (Apr-Jun)', () => {
			const result = getCurrentCycleActivityWindow( new Date( '2024-05-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-04-01' ),
				finish: new Date( '2024-06-30' ),
			} );
		} );

		it( 'should return Q3 activity window for dates in Q3 period (Jul-Sep)', () => {
			const result = getCurrentCycleActivityWindow( new Date( '2024-08-15' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-07-01' ),
				finish: new Date( '2024-09-30' ),
			} );
		} );

		it( 'should handle edge dates correctly', () => {
			// First day of Q1
			let result = getCurrentCycleActivityWindow( new Date( '2024-01-01' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-01-01' ),
				finish: new Date( '2024-03-31' ),
			} );

			// Last day of Q1
			result = getCurrentCycleActivityWindow( new Date( '2024-03-31' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-01-01' ),
				finish: new Date( '2024-03-31' ),
			} );

			// First day of Q4
			result = getCurrentCycleActivityWindow( new Date( '2024-10-01' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-10-01' ),
				finish: new Date( '2024-12-31' ),
			} );

			// Last day of Q4
			result = getCurrentCycleActivityWindow( new Date( '2024-12-31' ) );
			expect( result ).toEqual( {
				start: new Date( '2024-10-01' ),
				finish: new Date( '2024-12-31' ),
			} );
		} );
	} );
} );
