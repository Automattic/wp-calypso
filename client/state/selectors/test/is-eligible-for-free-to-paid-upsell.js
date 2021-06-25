/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import isEligibleForFreeToPaidUpsell from '../is-eligible-for-free-to-paid-upsell';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isMappedDomainSite from 'calypso/state/selectors/is-mapped-domain-site';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import isVipSite from 'calypso/state/selectors/is-vip-site';

jest.mock( 'calypso/state/selectors/can-current-user', () => require( 'sinon' ).stub() );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: require( 'sinon' ).stub(),
} ) );
jest.mock( 'calypso/state/selectors/is-mapped-domain-site', () => require( 'sinon' ).stub() );
jest.mock( 'calypso/state/selectors/is-site-on-free-plan', () => require( 'sinon' ).stub() );
jest.mock( 'calypso/state/selectors/is-vip-site', () => require( 'sinon' ).stub() );

describe( 'isEligibleForFreeToPaidUpsell', () => {
	const state = 'state';
	const siteId = 'siteId';

	const meetAllConditions = () => {
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( true );
		isJetpackSite.withArgs( state, siteId ).returns( false );
		isMappedDomainSite.withArgs( state, siteId ).returns( false );
		isSiteOnFreePlan.withArgs( state, siteId ).returns( true );
		isVipSite.withArgs( state, siteId ).returns( false );
	};

	test( 'should return false when user can not manage options', () => {
		meetAllConditions();
		canCurrentUser.withArgs( state, siteId, 'manage_options' ).returns( false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return false when site is Jetpack', () => {
		meetAllConditions();
		isJetpackSite.withArgs( state, siteId ).returns( true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return false when site has mapped domain', () => {
		meetAllConditions();
		isMappedDomainSite.withArgs( state, siteId ).returns( true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return false when site is not on a free plan', () => {
		meetAllConditions();
		isSiteOnFreePlan.withArgs( state, siteId ).returns( false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return false when site is a vip site', () => {
		meetAllConditions();
		isVipSite.withArgs( state, siteId ).returns( true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).to.be.false;
	} );

	test( 'should return true when all conditions are met', () => {
		meetAllConditions();
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).to.be.true;
	} );
} );
