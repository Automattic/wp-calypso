jest.mock( 'state/selectors/can-current-user', () => require( 'sinon' ).stub() );
jest.mock( 'state/selectors/is-mapped-domain-site', () => require( 'sinon' ).stub() );
jest.mock( 'state/selectors/is-site-on-free-plan', () => require( 'sinon' ).stub() );
jest.mock( 'state/selectors/is-user-registration-days-within-range', () => require( 'sinon' ).stub() );
jest.mock( 'state/selectors/is-vip-site', () => require( 'sinon' ).stub() );

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import canCurrentUser from 'state/selectors/can-current-user';
import isEligibleForFreeToPaidUpsell from '../is-eligible-for-free-to-paid-upsell';
import isMappedDomainSite from 'state/selectors/is-mapped-domain-site';
import isSiteOnFreePlan from 'state/selectors/is-site-on-free-plan';
import isUserRegistrationDaysWithinRange from 'state/selectors/is-user-registration-days-within-range';
import isVipSite from 'state/selectors/is-vip-site';

describe( 'isEligibleForFreeToPaidUpsell', () => {
	const state = 'state';
	const moment = 'moment';
	const siteId = 'siteId';

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
