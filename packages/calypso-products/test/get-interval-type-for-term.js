import {
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_CENTENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
} from '../src/constants';
import { getIntervalTypeForTerm } from '../src/get-interval-type-for-term';

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

	test( 'should return 3-year intervalType if current plan is a 3-year plan', () => {
		expect( getIntervalTypeForTerm( TERM_TRIENNIALLY ) ).toBe( '3yearly' );
	} );

	test( 'should return 100-year intervalType if current plan is a 100-year plan', () => {
		expect( getIntervalTypeForTerm( TERM_CENTENNIALLY ) ).toBe( '100yearly' );
	} );
} );
