import { when } from 'jest-when';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isMappedDomainSite from 'calypso/state/selectors/is-mapped-domain-site';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isEligibleForFreeToPaidUpsell from '../is-eligible-for-free-to-paid-upsell';

jest.mock( 'calypso/state/selectors/can-current-user', () => ( {
	canCurrentUser: jest.fn(),
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/selectors/is-mapped-domain-site', () => jest.fn() );
jest.mock( 'calypso/state/selectors/is-site-on-free-plan', () => jest.fn() );
jest.mock( 'calypso/state/selectors/is-vip-site', () => jest.fn() );

describe( 'isEligibleForFreeToPaidUpsell', () => {
	const state = 'state';
	const siteId = 'siteId';

	const meetAllConditions = () => {
		when( canCurrentUser ).calledWith( state, siteId, 'manage_options' ).mockReturnValue( true );
		when( isJetpackSite ).calledWith( state, siteId ).mockReturnValue( false );
		when( isMappedDomainSite ).calledWith( state, siteId ).mockReturnValue( false );
		when( isSiteOnFreePlan ).calledWith( state, siteId ).mockReturnValue( true );
		when( isVipSite ).calledWith( state, siteId ).mockReturnValue( false );
	};

	test( 'should return false when user can not manage options', () => {
		meetAllConditions();
		when( canCurrentUser ).calledWith( state, siteId, 'manage_options' ).mockReturnValue( false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when site is Jetpack', () => {
		meetAllConditions();
		when( isJetpackSite ).calledWith( state, siteId ).mockReturnValue( true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when site has mapped domain', () => {
		meetAllConditions();
		when( isMappedDomainSite ).calledWith( state, siteId ).mockReturnValue( true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when site is not on a free plan', () => {
		meetAllConditions();
		when( isSiteOnFreePlan ).calledWith( state, siteId ).mockReturnValue( false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when site is a vip site', () => {
		meetAllConditions();
		when( isVipSite ).calledWith( state, siteId ).mockReturnValue( true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return true when all conditions are met', () => {
		meetAllConditions();
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( true );
	} );
} );
