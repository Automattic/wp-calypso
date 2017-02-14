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
	let canCurrentUser;
	let getCurrentPlan;
	let eligibleForFreeToPaidUpsell;

	useMockery( mockery => {
		canCurrentUser = stub();
		getCurrentPlan = stub();
		mockery.registerMock( 'state/selectors/', { canCurrentUser } );
		mockery.registerMock( 'state/sites/plans/selectors', { getCurrentPlan } );
	} );

	before( () => {
		eligibleForFreeToPaidUpsell = require( '../eligible-for-free-to-paid-upsell' );
	} );

	describe( 'user can not manage options', () => {
		it( 'should return false', () => {
			getCurrentPlan.returns( { product_slug: PLAN_FREE } );
			canCurrentUser.withArgs( state, 'site1', 'manage_options' ).returns( false );
			const eligible = eligibleForFreeToPaidUpsell( state, 'site1' );
			expect( eligible ).to.be.false;
		} );
	} );

	describe( 'user can manage options for site', () => {
		before( () => {
			canCurrentUser.withArgs( state, 'site1', 'manage_options' ).returns( true );
		} );

		it( 'should return false when plan is not known', () => {
			getCurrentPlan.returns( null );
			const eligible = eligibleForFreeToPaidUpsell( state, 'site1' );
			expect( eligible ).to.be.false;
		} );

		it( 'should return false when not on free plan', () => {
			getCurrentPlan.returns( { product_slug: PLAN_BUSINESS } );
			const eligible = eligibleForFreeToPaidUpsell( state, 'site1' );
			expect( eligible ).to.be.false;
		} );

		it( 'should return true when on free plan', () => {
			getCurrentPlan.returns( { product_slug: PLAN_FREE } );
			const eligible = eligibleForFreeToPaidUpsell( state, 'site1' );
			expect( eligible ).to.be.true;
		} );
	} );
} );
