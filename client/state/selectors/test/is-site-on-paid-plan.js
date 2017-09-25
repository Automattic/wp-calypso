/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import { PLAN_BUSINESS, PLAN_FREE, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_FREE } from 'lib/plans/constants';
import useMockery from 'test/helpers/use-mockery';

describe( 'isSiteOnPaidPlan', () => {
	const state = deepFreeze( {} );
	let getCurrentPlan;
	let isSiteOnPaidPlan;

	useMockery( mockery => {
		getCurrentPlan = stub();
		mockery.registerMock( 'state/sites/plans/selectors', { getCurrentPlan } );
	} );

	before( () => {
		isSiteOnPaidPlan = require( '../is-site-on-paid-plan' );
	} );

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
