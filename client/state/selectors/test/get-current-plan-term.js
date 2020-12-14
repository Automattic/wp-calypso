/**
 * Internal dependencies
 */

import { getPlan } from 'calypso/lib/plans';
import { getSitePlan } from 'calypso/state/sites/selectors';
import getCurrentPlanTerm from '../get-current-plan-term';
import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from 'calypso/lib/plans/constants';

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSitePlan: jest.fn( () => ( {} ) ),
} ) );

jest.mock( 'calypso/lib/plans', () => ( {
	getPlan: jest.fn( () => ( {} ) ),
} ) );

describe( 'getCurrentPlanTerm', () => {
	const state = {};

	beforeEach( () => {
		getPlan.mockReset();
		getSitePlan.mockImplementation( () => ( {} ) );
	} );

	test( 'should return 2-year intervalType if current plan is a 2-year plan', () => {
		getPlan.mockImplementation( () => ( {
			term: TERM_BIENNIALLY,
		} ) );
		const result = getCurrentPlanTerm( state, {} );
		expect( result ).toBe( TERM_BIENNIALLY );
	} );

	test( 'should return 1-year intervalType if current plan is a 1-year plan', () => {
		getPlan.mockImplementation( () => ( {
			term: TERM_ANNUALLY,
		} ) );
		const result = getCurrentPlanTerm( state, {} );
		expect( result ).toBe( TERM_ANNUALLY );
	} );

	test( 'should return monthly intervalType if current plan is a monthly plan', () => {
		getPlan.mockImplementation( () => ( {
			term: TERM_MONTHLY,
		} ) );
		const result = getCurrentPlanTerm( state, {} );
		expect( result ).toBe( TERM_MONTHLY );
	} );

	test( 'should return null intervalType if no product can be identified', () => {
		getSitePlan.mockImplementation( () => null );
		const result = getCurrentPlanTerm( state, {} );
		expect( result ).toBeNull();
	} );

	test( 'should return null intervalType if no plan can be identified', () => {
		getSitePlan.mockImplementation( () => ( {} ) );
		getPlan.mockImplementation( () => null );
		const result = getCurrentPlanTerm( state, {} );
		expect( result ).toBeNull();
	} );
} );
