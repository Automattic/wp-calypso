import { DomainStatus, DomainSubtype, WhoisType } from '@automattic/api-core';
import {
	canEnableAutoRenew,
	findRegistrantWhois,
	findPrivacyServiceWhois,
	isPendingPrimaryDomain,
} from '../domain';
import type { DomainSummary, WhoisDataEntry } from '@automattic/api-core';

describe( 'utils', () => {
	const whoisData = [
		{
			org: 'The best company',
			type: WhoisType.REGISTRANT,
		},
		{
			org: 'Privacy R US',
			type: WhoisType.PRIVACY_SERVICE,
		},
	] as WhoisDataEntry[];

	describe( 'findRegistrantWhois', () => {
		test( 'should return undefined when not registrant object found', () => {
			expect( findRegistrantWhois( [] ) ).toBeUndefined();
		} );
		test( 'should return registrant object from Whois data', () => {
			expect( findRegistrantWhois( whoisData ) ).toEqual( whoisData[ 0 ] );
		} );
	} );

	describe( 'findPrivacyServiceWhois', () => {
		test( 'should return undefined when not registrant object found', () => {
			expect( findPrivacyServiceWhois( [] ) ).toBeUndefined();
		} );
		test( 'should return privacy service object from Whois data', () => {
			expect( findPrivacyServiceWhois( whoisData ) ).toEqual( whoisData[ 1 ] );
		} );
	} );

	describe( 'isPendingPrimaryDomain', () => {
		const baseDomain = {
			subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
			can_set_as_primary: true,
			primary_domain: false,
		} as DomainSummary;

		test( 'returns true when the backend reports the domain as pending', () => {
			expect( isPendingPrimaryDomain( { ...baseDomain, set_primary_domain_pending: true } ) ).toBe(
				true
			);
		} );

		test( 'returns false when the backend reports the domain as not pending', () => {
			expect( isPendingPrimaryDomain( { ...baseDomain, set_primary_domain_pending: false } ) ).toBe(
				false
			);
		} );

		test( 'returns false for a non-primary registration the backend does not report as pending', () => {
			expect( isPendingPrimaryDomain( baseDomain ) ).toBe( false );
		} );
	} );

	describe( 'canEnableAutoRenew', () => {
		const baseDomain = {
			subscription_id: 'sub123',
			expired: false,
			is_domain_only_site: false,
			domain_status: { id: DomainStatus.ACTIVE, label: 'Active', type: 'success' },
		} as DomainSummary;

		test( 'returns true for an active domain with a subscription', () => {
			expect( canEnableAutoRenew( baseDomain ) ).toBe( true );
		} );

		test( 'returns false when the domain has no subscription', () => {
			expect( canEnableAutoRenew( { ...baseDomain, subscription_id: null } ) ).toBe( false );
		} );

		test( 'returns false for an expired domain', () => {
			// Redeemable and cancelled-but-recoverable domains also surface as
			// expired in the list, so this guards those states too.
			expect(
				canEnableAutoRenew( {
					...baseDomain,
					expired: true,
					domain_status: { id: DomainStatus.EXPIRED, label: 'Expired', type: 'error' },
				} )
			).toBe( false );
		} );

		test( 'returns false for a parked (domain-only) expired domain', () => {
			expect(
				canEnableAutoRenew( {
					...baseDomain,
					expired: true,
					is_domain_only_site: true,
					domain_status: { id: DomainStatus.EXPIRED, label: 'Expired', type: 'error' },
				} )
			).toBe( false );
		} );

		test( 'returns false for a domain expired in auction', () => {
			expect(
				canEnableAutoRenew( {
					...baseDomain,
					domain_status: {
						id: DomainStatus.EXPIRED_IN_AUCTION,
						label: 'Expired',
						type: 'error',
					},
				} )
			).toBe( false );
		} );

		test( 'returns false for a domain with a renewal in progress', () => {
			expect(
				canEnableAutoRenew( {
					...baseDomain,
					domain_status: {
						id: DomainStatus.PENDING_RENEWAL,
						label: 'Pending renewal',
						type: 'warning',
					},
				} )
			).toBe( false );
		} );

		test( 'returns false for a domain with a transfer in progress', () => {
			expect(
				canEnableAutoRenew( {
					...baseDomain,
					domain_status: {
						id: DomainStatus.PENDING_TRANSFER,
						label: 'Pending transfer',
						type: 'warning',
					},
				} )
			).toBe( false );
		} );

		test( 'returns false for a domain pending registration', () => {
			expect(
				canEnableAutoRenew( {
					...baseDomain,
					domain_status: {
						id: DomainStatus.PENDING_REGISTRATION,
						label: 'Pending registration',
						type: 'warning',
					},
				} )
			).toBe( false );
		} );
	} );
} );
