import {
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_CENTENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
	TERM_DECENNIALLY,
	PLAN_MONTHLY_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
	PLAN_DECENNIAL_PERIOD,
	PLAN_CENTENNIAL_PERIOD,
} from '../src/constants';
import {
	calculateMonthlyPrice,
	getBillingMonthsForTerm,
	getTermFromDuration,
	getTermDuration,
} from '../src/index';

describe( 'calculateMonthlyPrice', () => {
	test( 'should return same number for monthly term', () => {
		expect( calculateMonthlyPrice( TERM_MONTHLY, 10 ) ).toBe( 10 );
		expect( calculateMonthlyPrice( TERM_MONTHLY, 12.32 ) ).toBe( 12.32 );
	} );
	test( 'should calculate proper result for annual term', () => {
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 12 ) ).toBe( 1.0 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 120 ) ).toBe( 10.0 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 240 ) ).toBe( 20.0 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 122 ) ).toBe( 10.17 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 127 ) ).toBe( 10.58 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 128 ) ).toBe( 10.67 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 129 ) ).toBe( 10.75 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 130 ) ).toBe( 10.83 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 131 ) ).toBe( 10.92 );
	} );
	test( 'should calculate proper result for biennial term', () => {
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 12 ) ).toBe( 0.5 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 120 ) ).toBe( 5.0 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 240 ) ).toBe( 10.0 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 122 ) ).toBe( 5.08 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 127 ) ).toBe( 5.29 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 128 ) ).toBe( 5.33 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 129 ) ).toBe( 5.38 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 130 ) ).toBe( 5.42 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 131 ) ).toBe( 5.46 );
	} );
	test( 'should calculate proper result for triennial term', () => {
		expect( calculateMonthlyPrice( TERM_TRIENNIALLY, 36 ) ).toBe( 1.0 );
		expect( calculateMonthlyPrice( TERM_TRIENNIALLY, 72 ) ).toBe( 2.0 );
		expect( calculateMonthlyPrice( TERM_TRIENNIALLY, 252 ) ).toBe( 7.0 );
	} );
} );

describe( 'getBillingMonthsForTerm', () => {
	test( 'should 1 for monthly term', () => {
		expect( getBillingMonthsForTerm( TERM_MONTHLY ) ).toBe( 1 );
	} );
	test( 'should 12 annual term', () => {
		expect( getBillingMonthsForTerm( TERM_ANNUALLY ) ).toBe( 12 );
	} );
	test( 'should 24 for biennial term', () => {
		expect( getBillingMonthsForTerm( TERM_BIENNIALLY ) ).toBe( 24 );
	} );
	test( 'should 36 for triennial term', () => {
		expect( getBillingMonthsForTerm( TERM_TRIENNIALLY ) ).toBe( 36 );
	} );
	test( 'should throw an error for unknown term', () => {
		expect( () => getBillingMonthsForTerm( 'fake' ) ).toThrow();
	} );
} );

describe( 'getTermDuration', () => {
	test( 'should 31 for monthly term', () => {
		expect( getTermDuration( TERM_MONTHLY ) ).toBe( 31 );
	} );
	test( 'should 365 annual term', () => {
		expect( getTermDuration( TERM_ANNUALLY ) ).toBe( 365 );
	} );
	test( 'should 730 for biennial term', () => {
		expect( getTermDuration( TERM_BIENNIALLY ) ).toBe( 730 );
	} );
	test( 'should 1095 for triennial term', () => {
		expect( getTermDuration( TERM_TRIENNIALLY ) ).toBe( 1095 );
	} );
	test( 'Should return 36500 for centennial term', () => {
		expect( getTermDuration( TERM_CENTENNIALLY ) ).toBe( 36500 );
	} );
	test( 'should return undefined for unknown term', () => {
		expect( getTermDuration( 'fake' ) ).toBeUndefined();
	} );
} );

describe( 'getTermFromDuration', () => {
	it( 'should return the correct billing term for a monthly period', () => {
		expect( getTermFromDuration( PLAN_MONTHLY_PERIOD ) ).toEqual( TERM_MONTHLY );
	} );

	it( 'should return the correct billing term for an annual period', () => {
		expect( getTermFromDuration( PLAN_ANNUAL_PERIOD ) ).toEqual( TERM_ANNUALLY );
	} );

	it( 'should return the correct billing term for a biennial period', () => {
		expect( getTermFromDuration( PLAN_BIENNIAL_PERIOD ) ).toEqual( TERM_BIENNIALLY );
	} );

	it( 'should return the correct billing term for a triennial period', () => {
		expect( getTermFromDuration( PLAN_TRIENNIAL_PERIOD ) ).toEqual( TERM_TRIENNIALLY );
	} );

	it( 'should return the correct billing term for a decennial period', () => {
		expect( getTermFromDuration( PLAN_DECENNIAL_PERIOD ) ).toEqual( TERM_DECENNIALLY );
	} );

	it( 'should return the correct billing term for a centennial period', () => {
		expect( getTermFromDuration( PLAN_CENTENNIAL_PERIOD ) ).toEqual( TERM_CENTENNIALLY );
	} );

	test( 'should return undefined for unknown term', () => {
		expect( getTermFromDuration( 3.14 ) ).toBeUndefined();
	} );
} );
