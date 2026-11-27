import { isDeepStrictEqual } from 'node:util';
import { vi } from 'vitest';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isMappedDomainSite from 'calypso/state/selectors/is-mapped-domain-site';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isEligibleForFreeToPaidUpsell from '../is-eligible-for-free-to-paid-upsell';

vi.mock( 'calypso/state/selectors/can-current-user', () => ( {
	canCurrentUser: vi.fn(),
} ) );
vi.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: vi.fn(),
} ) );
vi.mock( 'calypso/state/selectors/is-mapped-domain-site', () => ( { default: vi.fn() } ) );
vi.mock( 'calypso/state/selectors/is-site-on-free-plan', () => ( { default: vi.fn() } ) );
vi.mock( 'calypso/state/selectors/is-vip-site', () => ( { default: vi.fn() } ) );

// Makes the mocked selector return `value` when it's called with `args`, and `undefined` otherwise.
const returnWhenCalledWith = ( selector, args, value ) =>
	vi
		.mocked( selector )
		.mockImplementation( ( ...actual ) =>
			isDeepStrictEqual( actual, args ) ? value : undefined
		);

describe( 'isEligibleForFreeToPaidUpsell', () => {
	const state = 'state';
	const siteId = 'siteId';

	const meetAllConditions = () => {
		returnWhenCalledWith( canCurrentUser, [ state, siteId, 'manage_options' ], true );
		returnWhenCalledWith( isJetpackSite, [ state, siteId ], false );
		returnWhenCalledWith( isMappedDomainSite, [ state, siteId ], false );
		returnWhenCalledWith( isSiteOnFreePlan, [ state, siteId ], true );
		returnWhenCalledWith( isVipSite, [ state, siteId ], false );
	};

	test( 'should return false when user can not manage options', () => {
		meetAllConditions();
		returnWhenCalledWith( canCurrentUser, [ state, siteId, 'manage_options' ], false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when site is Jetpack', () => {
		meetAllConditions();
		returnWhenCalledWith( isJetpackSite, [ state, siteId ], true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when site has mapped domain', () => {
		meetAllConditions();
		returnWhenCalledWith( isMappedDomainSite, [ state, siteId ], true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when site is not on a free plan', () => {
		meetAllConditions();
		returnWhenCalledWith( isSiteOnFreePlan, [ state, siteId ], false );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return false when site is a vip site', () => {
		meetAllConditions();
		returnWhenCalledWith( isVipSite, [ state, siteId ], true );
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( false );
	} );

	test( 'should return true when all conditions are met', () => {
		meetAllConditions();
		expect( isEligibleForFreeToPaidUpsell( state, siteId ) ).toBe( true );
	} );
} );
