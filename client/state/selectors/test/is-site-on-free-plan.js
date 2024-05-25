import { PLAN_BUSINESS, PLAN_FREE, PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import deepFreeze from 'deep-freeze';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import isSiteOnFreePlan from '../is-site-on-free-plan';

jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getCurrentPlan: jest.fn(),
} ) );

describe( 'isSiteOnFreePlan', () => {
	const state = deepFreeze( {} );

	test( 'should return false when plan is not known', () => {
		getCurrentPlan.mockReturnValue( null );
		expect( isSiteOnFreePlan( state, 'site1' ) ).toBe( false );
	} );

	test( 'should return false when not on free plan', () => {
		getCurrentPlan.mockReturnValue( { productSlug: PLAN_BUSINESS } );
		expect( isSiteOnFreePlan( state, 'site1' ) ).toBe( false );
	} );

	test( 'should return true when on free plan', () => {
		getCurrentPlan.mockReturnValue( { productSlug: PLAN_FREE } );
		expect( isSiteOnFreePlan( state, 'site1' ) ).toBe( true );
	} );

	test( 'should return true when on free Jetpack plan', () => {
		getCurrentPlan.mockReturnValue( { productSlug: PLAN_JETPACK_FREE } );
		expect( isSiteOnFreePlan( state, 'site1' ) ).toBe( true );
	} );
} );
