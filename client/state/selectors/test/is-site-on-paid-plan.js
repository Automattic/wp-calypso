/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import isSiteOnPaidPlan from '../is-site-on-paid-plan';
import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_FREE,
} from 'calypso/lib/plans/constants';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getCurrentPlan: require( 'sinon' ).stub(),
} ) );

describe( 'isSiteOnPaidPlan', () => {
	const state = deepFreeze( {} );

	test( 'should return false when plan is not known', () => {
		getCurrentPlan.returns( null );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.false;
	} );

	test( 'should return false when on free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_FREE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.false;
	} );

	test( 'should return false when on free Jetpack plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_FREE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.false;
	} );

	test( 'should return true when on paid plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_BUSINESS } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.true;
	} );

	test( 'should return true when on eCommerce plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_ECOMMERCE } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.true;
	} );

	test( 'should return true when on paid Jetpack plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_JETPACK_BUSINESS } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.true;
	} );
} );
