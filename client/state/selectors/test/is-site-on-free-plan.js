/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import {
	PLAN_BUSINESS,
	PLAN_FREE
} from 'lib/plans/constants';
import useMockery from 'test/helpers/use-mockery';

describe( 'eligibleForFreeToPaidUpsell', () => {
	const state = deepFreeze( {} );
	let getCurrentPlan;
	let isSiteOnFreePlan;

	useMockery( mockery => {
		getCurrentPlan = stub();
		mockery.registerMock( 'state/sites/plans/selectors', { getCurrentPlan } );
	} );

	before( () => {
		isSiteOnFreePlan = require( '../is-site-on-free-plan' );
	} );

	it( 'should return null when plan is not known', () => {
		getCurrentPlan.returns( null );
		expect( isSiteOnFreePlan( state, 'site1' ) ).to.be.null;
	} );

	it( 'should return false when not on free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_BUSINESS } );
		expect( isSiteOnFreePlan( state, 'site1' ) ).to.be.false;
	} );

	it( 'should return true when on free plan', () => {
		getCurrentPlan.returns( { productSlug: PLAN_FREE } );
		expect( isSiteOnFreePlan( state, 'site1' ) ).to.be.true;
	} );
} );
