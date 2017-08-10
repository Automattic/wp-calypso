/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'isEligibleForFreeToPaidUpsell', () => {
	const state = 'state';
	const moment = 'moment';
	const siteId = 'siteId';

	let canCurrentUser;
	let isMappedDomainSite;
	let isSiteOnFreePlan;
	let isUserRegistrationDaysWithinRange;
	let isVipSite;
	let isEligibleForFreeToPaidUpsell;

	useMockery( mockery => {
		canCurrentUser = stub();
		isMappedDomainSite = stub();
		isSiteOnFreePlan = stub();
		isUserRegistrationDaysWithinRange = stub();
		isVipSite = stub();

		mockery.registerMock( 'state/selectors/can-current-user', canCurrentUser );
		mockery.registerMock( 'state/selectors/is-mapped-domain-site', isMappedDomainSite );
		mockery.registerMock( 'state/selectors/is-site-on-free-plan', isSiteOnFreePlan );
		mockery.registerMock(
			'state/selectors/is-user-registration-days-within-range',
			isUserRegistrationDaysWithinRange
		);
		mockery.registerMock( 'state/selectors/is-vip-site', isVipSite );
	} );

	before( () => {
		isEligibleForFreeToPaidUpsell = require( '../is-eligible-for-free-to-paid-upsell' );
	} );

	const meetAllConditions = () => {
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( true );
		isMappedDomainSite.withArgs( state, siteId ).returns( false );
		isSiteOnFreePlan.withArgs( state, siteId ).returns( true );
		isUserRegistrationDaysWithinRange.withArgs( state, moment, 0, 180 ).returns( true );
		isVipSite.withArgs( state, siteId ).returns( false );
	};

	it( 'should return false when user can not manage options', () => {
		meetAllConditions();
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return false when site has mapped domain', () => {
		meetAllConditions();
		isMappedDomainSite.withArgs( state, siteId ).returns( true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return false when site is not on a free plan', () => {
		meetAllConditions();
		isSiteOnFreePlan.withArgs( state, siteId ).returns( false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return false when user registration days is not within range', () => {
		meetAllConditions();
		isUserRegistrationDaysWithinRange.withArgs( state, moment, 0, 180 ).returns( false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return false when site is a vip site', () => {
		meetAllConditions();
		isVipSite.withArgs( state, siteId ).returns( true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.false;
	} );

	it( 'should return true when all conditions are met', () => {
		meetAllConditions();
		expect( isEligibleForFreeToPaidUpsell( state, siteId, moment ) ).to.be.true;
	} );
} );
