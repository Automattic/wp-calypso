/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'eligibleForFreeToPaidUpsell', () => {
	const state = deepFreeze( {} );
	let canCurrentUser;
	let isSiteOnFreePlan;
	let eligibleForFreeToPaidUpsell;

	useMockery( mockery => {
		canCurrentUser = stub();
		isSiteOnFreePlan = stub();
		mockery.registerMock( 'state/selectors/', {
			canCurrentUser,
			isSiteOnFreePlan
		} );
	} );

	before( () => {
		eligibleForFreeToPaidUpsell = require( '../eligible-for-free-to-paid-upsell' );
	} );

	it( 'should return false when user can not manage options', () => {
		canCurrentUser.withArgs( state, 'site1', 'manage_options' ).returns( false );
		expect( eligibleForFreeToPaidUpsell( state, 'site1' ) ).to.be.false;
	} );

	it( 'should return false when site is not on a free plan', () => {
		canCurrentUser.withArgs( state, 'site1', 'manage_options' ).returns( true );
		isSiteOnFreePlan.withArgs( state, 'site1' ).returns( false );
		expect( eligibleForFreeToPaidUpsell( state, 'site1' ) ).to.be.false;
	} );

	it( 'should return true when user can manage options and site is on a free plan', () => {
		canCurrentUser.withArgs( state, 'site1', 'manage_options' ).returns( true );
		isSiteOnFreePlan.withArgs( state, 'site1' ).returns( true );
		expect( eligibleForFreeToPaidUpsell( state, 'site1' ) ).to.be.true;
	} );
} );
