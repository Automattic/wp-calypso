jest.mock( 'state/sites/plans/selectors', () => ( { getCurrentPlan: require( 'sinon' ).stub() } ) );

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_FREE,
} from 'lib/plans/constants';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import isSiteOnPaidPlan from '../is-site-on-paid-plan';

describe( 'isSiteOnPaidPlan', () => {
	const state = deepFreeze( {} );

	it( 'should return false when plan is not known', () => {
		getCurrentPlan.returns( null );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.false;
	} );

	it( 'should return false when on free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_FREE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.false;
	} );

	it( 'should return false when on free Jetpack plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_FREE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.false;
	} );

	it( 'should return true when on paid plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_BUSINESS } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.true;
	} );

	it( 'should return true when on paid Jetpack plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_BUSINESS } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.true;
	} );
} );
