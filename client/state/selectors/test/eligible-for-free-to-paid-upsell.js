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
	const moment = 'moment';
	const siteId = 'siteId';

	let canCurrentUser;
	let isMappedDomainSite;
	let isSiteOnFreePlan;
	let isUserRegistrationDaysWithinRange;
	let eligibleForFreeToPaidUpsell;

	useMockery( mockery => {
		canCurrentUser = stub();
		isMappedDomainSite = stub();
		isSiteOnFreePlan = stub();
		isUserRegistrationDaysWithinRange = stub();

		mockery.registerMock( 'state/selectors/', {
			canCurrentUser,
			isMappedDomainSite,
			isSiteOnFreePlan,
			isUserRegistrationDaysWithinRange
		} );
	} );

	before( () => {
		eligibleForFreeToPaidUpsell = require( '../eligible-for-free-to-paid-upsell' );
	} );

	const meetAllConditions = () => {
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( true );
		isMappedDomainSite.withArgs( state, siteId ).returns( false );
		isSiteOnFreePlan.withArgs( state, siteId ).returns( true );
		isUserRegistrationDaysWithinRange.withArgs( state, moment, 0, 180 ).returns( true );
	};

	it( 'should return false when user can not manage options', () => {
		meetAllConditions();
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( false );
		expect( eligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return false when site has mapped domain', () => {
		meetAllConditions();
		isMappedDomainSite.withArgs( state, siteId ).returns( true );
		expect( eligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return false when site is not on a free plan', () => {
		meetAllConditions();
		isSiteOnFreePlan.withArgs( state, siteId ).returns( false );
		expect( eligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return false when user registration days is not within range', () => {
		meetAllConditions();
		isUserRegistrationDaysWithinRange.withArgs( state, moment, 0, 180 ).returns( false );
		expect( eligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return true when all conditions are met', () => {
		meetAllConditions();
		expect( eligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.true;
	} );
} );
