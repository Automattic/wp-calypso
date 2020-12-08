/**
 * Internal dependencies
 */

import getIntervalTypeFromTerm from '../get-interval-type-for-term';
import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from 'calypso/lib/plans/constants';

describe( 'getIntervalTypeFromTerm', () => {
	test( 'should return 2-year intervalType if current plan is a 2-year plan', () => {
		expect( getIntervalTypeFromTerm( TERM_BIENNIALLY ) ).toBe( '2yearly' );
	} );

	test( 'should return 1-year intervalType if current plan is a 1-year plan', () => {
		expect( getIntervalTypeFromTerm( TERM_ANNUALLY ) ).toBe( 'yearly' );
	} );

	test( 'should return monthly intervalType if current plan is a monthly plan', () => {
		expect( getIntervalTypeFromTerm( TERM_MONTHLY ) ).toBe( 'monthly' );
	} );

	test( 'should return null intervalType if no product can be identified', () => {
		expect( getIntervalTypeFromTerm( 'fake' ) ).toBeNull();
	} );
} );
