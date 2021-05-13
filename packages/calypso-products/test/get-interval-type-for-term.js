/**
 * Internal dependencies
 */

import { getIntervalTypeForTerm } from '../src/get-interval-type-for-term';
import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from '../src/constants';

describe( 'getIntervalTypeForTerm', () => {
	test( 'should return 2-year intervalType if current plan is a 2-year plan', () => {
		expect( getIntervalTypeForTerm( TERM_BIENNIALLY ) ).toBe( '2yearly' );
	} );

	test( 'should return 1-year intervalType if current plan is a 1-year plan', () => {
		expect( getIntervalTypeForTerm( TERM_ANNUALLY ) ).toBe( 'yearly' );
	} );

	test( 'should return monthly intervalType if current plan is a monthly plan', () => {
		expect( getIntervalTypeForTerm( TERM_MONTHLY ) ).toBe( 'monthly' );
	} );

	test( 'should return null intervalType if no product can be identified', () => {
		expect( getIntervalTypeForTerm( 'fake' ) ).toBeNull();
	} );
} );
