/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import { PLAN_BUSINESS, PLAN_FREE } from 'lib/plans/constants';
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

	it( 'should return true when on paid plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_BUSINESS } );
		expect( isSiteOnPaidPlan( state, 'site1' ) ).to.be.true;
	} );
} );
