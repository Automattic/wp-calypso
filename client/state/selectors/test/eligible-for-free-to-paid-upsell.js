/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'eligibleForFreeToPaidUpsell', () => {
	const state = 'state';
	const siteId = 'siteId';

	let canCurrentUser;
	let isSiteOnFreePlan;
	let eligibleForFreeToPaidUpsell;
	let isUserRegistrationDaysWithinRange;

	useMockery( mockery => {
		canCurrentUser = stub();
		isSiteOnFreePlan = stub();
		isUserRegistrationDaysWithinRange = stub();
		mockery.registerMock( 'state/selectors/', {
			canCurrentUser,
			isSiteOnFreePlan,
			isUserRegistrationDaysWithinRange
		} );
	} );

	before( () => {
		eligibleForFreeToPaidUpsell = require( '../eligible-for-free-to-paid-upsell' );
	} );

	it( 'should return false when user can not manage options', () => {
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( false );
		expect( eligibleForFreeToPaidUpsell( state, siteId ) ).to.be.false;
	} );

	it( 'should return false when site is not on a free plan', () => {
		isSiteOnFreePlan.withArgs( state, siteId ).returns( false );
		expect( eligibleForFreeToPaidUpsell( state, siteId ) ).to.be.false;
	} );

	it( 'should return false when user registration days is not within range', () => {
		isUserRegistrationDaysWithinRange.withArgs( state, 2, 30 ).returns( false );
		expect( eligibleForFreeToPaidUpsell( state, siteId ) ).to.be.false;
	} );

	it( 'should return true when all conditions are met', () => {
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( true );
		isSiteOnFreePlan.withArgs( state, siteId ).returns( true );
		isUserRegistrationDaysWithinRange.withArgs( state, 2, 30 ).returns( true );
		expect( eligibleForFreeToPaidUpsell( state, siteId ) ).to.be.true;
	} );
} );
