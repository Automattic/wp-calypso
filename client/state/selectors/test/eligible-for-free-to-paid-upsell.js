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
	let getCurrentPlan;
	let eligibleForFreeToPaidUpsell;

	useMockery( mockery => {
		getCurrentPlan = stub();
		mockery.registerMock( 'state/sites/plans/selectors', { getCurrentPlan } );
	} );

	before( () => {
		eligibleForFreeToPaidUpsell = require( '..' ).eligibleForFreeToPaidUpsell;
	} );

	it( 'should return false when plan is not known', () => {
		getCurrentPlan.returns( null );
		const state = deepFreeze( {} );
		const eligible = eligibleForFreeToPaidUpsell( state, 'site1' );
		expect( eligible ).to.be.false;
	} );

	it( 'should return true when on free plan', () => {
		getCurrentPlan.returns( { product_slug: PLAN_FREE } );
		const state = deepFreeze( {} );
		const eligible = eligibleForFreeToPaidUpsell( state, 'site1' );
		expect( eligible ).to.be.true;
	} );

	it( 'should return false when not on free plan', () => {
		getCurrentPlan.returns( { product_slug: PLAN_BUSINESS } );
		const state = deepFreeze( {} );
		const eligible = eligibleForFreeToPaidUpsell( state, 'site1' );
		expect( eligible ).to.be.false;
	} );
} );
