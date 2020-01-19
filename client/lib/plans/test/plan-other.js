/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY, getTermDuration } from '../constants';
import { calculateMonthlyPrice, getBillingMonthsForTerm } from '../index';

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
	test( 'should throw an error for unknown term', () => {
		expect( () => getBillingMonthsForTerm( 'fake' ) ).toThrowError();
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
	test( 'should return undefined for unknown term', () => {
		expect( getTermDuration( 'fake' ) ).toBeUndefined();
	} );
} );
