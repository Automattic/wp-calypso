/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isEligibleForDomainToPaidPlanUpsell from '../is-eligible-for-domain-to-paid-plan-upsell';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import isMappedDomainSite from 'calypso/state/selectors/is-mapped-domain-site';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import isVipSite from 'calypso/state/selectors/is-vip-site';

jest.mock( 'state/selectors/can-current-user', () => require( 'sinon' ).stub() );
jest.mock( 'state/selectors/is-mapped-domain-site', () => require( 'sinon' ).stub() );
jest.mock( 'state/selectors/is-site-on-free-plan', () => require( 'sinon' ).stub() );
jest.mock( 'state/selectors/is-vip-site', () => require( 'sinon' ).stub() );

describe( 'isEligibleForDomainToPaidPlanUpsell', () => {
	const state = 'state';
	const siteId = 'siteId';

	const meetAllConditions = () => {
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( true );
		isMappedDomainSite.withArgs( state, siteId ).returns( true );
		isSiteOnFreePlan.withArgs( state, siteId ).returns( true );
		isVipSite.withArgs( state, siteId ).returns( false );
	};

	test( 'should return false when user can not manage options', () => {
		meetAllConditions();
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( false );
		expect( isEligibleForDomainToPaidPlanUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return false when site does not have mapped domain', () => {
		meetAllConditions();
		isMappedDomainSite.withArgs( state, siteId ).returns( false );
		expect( isEligibleForDomainToPaidPlanUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return false when site is not on a free plan', () => {
		meetAllConditions();
		isSiteOnFreePlan.withArgs( state, siteId ).returns( false );
		expect( isEligibleForDomainToPaidPlanUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return false when site is a vip site', () => {
		meetAllConditions();
		isVipSite.withArgs( state, siteId ).returns( true );
		expect( isEligibleForDomainToPaidPlanUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return true when all conditions are met', () => {
		meetAllConditions();
		expect( isEligibleForDomainToPaidPlanUpsell( state, siteId ) ).to.be.true;
	} );
} );
