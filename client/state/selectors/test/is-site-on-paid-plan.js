import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_FREE,
} from '@automattic/calypso-products';
import deepFreeze from 'deep-freeze';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import isSiteOnPaidPlan from '../is-site-on-paid-plan';

jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getCurrentPlan: jest.fn(),
} ) );

describe( 'isSiteOnPaidPlan', () => {
	const state = deepFreeze( {} );

	test( 'should return false when plan is not known', () => {
		getCurrentPlan.mockReturnValue( null );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).toBe( false );
	} );

	test( 'should return false when on free plan', () => {
		getCurrentPlan.mockReturnValue( { productSlug: PLAN_FREE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).toBe( false );
	} );

	test( 'should return false when on free Jetpack plan', () => {
		getCurrentPlan.mockReturnValue( { productSlug: PLAN_JETPACK_FREE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).toBe( false );
	} );

	test( 'should return true when on paid plan', () => {
		getCurrentPlan.mockReturnValue( { productSlug: PLAN_BUSINESS } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).toBe( true );
	} );

	test( 'should return true when on eCommerce plan', () => {
		getCurrentPlan.mockReturnValue( { productSlug: PLAN_ECOMMERCE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).toBe( true );
	} );

	test( 'should return true when on paid Jetpack plan', () => {
		getCurrentPlan.mockReturnValue( { productSlug: PLAN_JETPACK_BUSINESS } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).toBe( true );
	} );
} );
