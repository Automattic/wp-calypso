/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from '../constants';
import { calculateMonthlyPrice } from '../index';

describe( 'calculateMonthlyPrice', () => {
	test( 'should return same number for monthly term', () => {
		expect( calculateMonthlyPrice( TERM_MONTHLY, 10 ) ).to.equal( 10 );
		expect( calculateMonthlyPrice( TERM_MONTHLY, 12.32 ) ).to.equal( 12.32 );
	} );
	test( 'should calculate proper result for annual term', () => {
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 12 ) ).to.equal( 1.0 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 120 ) ).to.equal( 10.0 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 240 ) ).to.equal( 20.0 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 122 ) ).to.equal( 10.17 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 127 ) ).to.equal( 10.58 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 128 ) ).to.equal( 10.67 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 129 ) ).to.equal( 10.75 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 130 ) ).to.equal( 10.83 );
		expect( calculateMonthlyPrice( TERM_ANNUALLY, 131 ) ).to.equal( 10.92 );
	} );
	test( 'should calculate proper result for biennial term', () => {
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 12 ) ).to.equal( 0.5 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 120 ) ).to.equal( 5.0 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 240 ) ).to.equal( 10.0 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 122 ) ).to.equal( 5.08 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 127 ) ).to.equal( 5.29 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 128 ) ).to.equal( 5.33 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 129 ) ).to.equal( 5.38 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 130 ) ).to.equal( 5.42 );
		expect( calculateMonthlyPrice( TERM_BIENNIALLY, 131 ) ).to.equal( 5.46 );
	} );
} );
