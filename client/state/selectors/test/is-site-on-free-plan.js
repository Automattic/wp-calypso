/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import isSiteOnFreePlan from '../is-site-on-free-plan';
import { PLAN_BUSINESS, PLAN_FREE, PLAN_JETPACK_FREE } from 'calypso/lib/plans/constants';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getCurrentPlan: require( 'sinon' ).stub(),
} ) );

describe( 'isSiteOnFreePlan', () => {
	const state = deepFreeze( {} );

	test( 'should return false when plan is not known', () => {
		getCurrentPlan.returns( null );
		expect( isSiteOnFreePlan( state, 'site1' ) ).to.be.false;
	} );

	test( 'should return false when not on free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_BUSINESS } );
		expect( isSiteOnFreePlan( state, 'site1' ) ).to.be.false;
	} );

	test( 'should return true when on free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_FREE } );
		expect( isSiteOnFreePlan( state, 'site1' ) ).to.be.true;
	} );

	test( 'should return true when on free Jetpack plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_FREE } );
		expect( isSiteOnFreePlan( state, 'site1' ) ).to.be.true;
	} );
} );
