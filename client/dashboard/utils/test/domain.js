import { DomainStatus, DomainSubtype, WhoisType } from '@automattic/api-core';
import {
	canEnableAutoRenew,
	findRegistrantWhois,
	findPrivacyServiceWhois,
	hasCustomPrimaryDomain,
	isPendingPrimaryDomain,
	isPendingPrimaryDomainCandidate,
} from '../domain';

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
	];

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

	describe( 'hasCustomPrimaryDomain', () => {
		const siteAddress = {
			subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: 'Default' },
			primary_domain: true,
		};
		const registration = {
			subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
			primary_domain: false,
		};

		test( 'returns false when the included site address is still the primary', () => {
			expect( hasCustomPrimaryDomain( [ siteAddress, registration ] ) ).toBe( false );
		} );

		test( 'returns true when a registration is the primary', () => {
			expect(
				hasCustomPrimaryDomain( [
					{ ...siteAddress, primary_domain: false },
					{ ...registration, primary_domain: true },
				] )
			).toBe( true );
		} );

		test( 'returns true when a connection is the primary', () => {
			expect(
				hasCustomPrimaryDomain( [
					{ ...siteAddress, primary_domain: false },
					{
						subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Connection' },
						primary_domain: true,
					},
				] )
			).toBe( true );
		} );
	} );

	describe( 'isPendingPrimaryDomainCandidate', () => {
		const baseDomain = {
			subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
			can_set_as_primary: true,
			primary_domain: false,
			expired: false,
		};

		test( 'returns true for a registration that is not yet primary', () => {
			expect( isPendingPrimaryDomainCandidate( baseDomain ) ).toBe( true );
		} );

		test( 'returns false when domain is already primary', () => {
			expect( isPendingPrimaryDomainCandidate( { ...baseDomain, primary_domain: true } ) ).toBe(
				false
			);
		} );

		test( 'returns false when domain cannot be set as primary', () => {
			expect(
				isPendingPrimaryDomainCandidate( { ...baseDomain, can_set_as_primary: false } )
			).toBe( false );
		} );

		test( 'returns false when domain is expired', () => {
			expect( isPendingPrimaryDomainCandidate( { ...baseDomain, expired: true } ) ).toBe( false );
		} );

		test( 'returns false for non-registration domains', () => {
			expect(
				isPendingPrimaryDomainCandidate( {
					...baseDomain,
					subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: 'Default' },
				} )
			).toBe( false );
		} );

		test( 'returns false for domain connections', () => {
			expect(
				isPendingPrimaryDomainCandidate( {
					...baseDomain,
					subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Connection' },
				} )
			).toBe( false );
		} );
	} );

	describe( 'isPendingPrimaryDomain', () => {
		const baseDomain = {
			subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
			can_set_as_primary: true,
			primary_domain: false,
			expired: false,
			points_to_wpcom: false,
			ssl_status: 'newly_registered',
		};

		test( 'returns true while the domain does not resolve to WordPress.com yet', () => {
			expect( isPendingPrimaryDomain( baseDomain ) ).toBe( true );
		} );

		test( 'returns true while the certificate is still pending', () => {
			expect(
				isPendingPrimaryDomain( {
					...baseDomain,
					points_to_wpcom: true,
					ssl_status: 'pending',
				} )
			).toBe( true );
		} );

		test( 'returns false for a domain that is already set up but is not primary', () => {
			expect(
				isPendingPrimaryDomain( {
					...baseDomain,
					points_to_wpcom: true,
					ssl_status: 'active',
				} )
			).toBe( false );
		} );

		test( 'returns false when domain is already primary', () => {
			expect( isPendingPrimaryDomain( { ...baseDomain, primary_domain: true } ) ).toBe( false );
		} );
	} );

	describe( 'canEnableAutoRenew', () => {
		const baseDomain = {
			subscription_id: 'sub123',
			expired: false,
			is_domain_only_site: false,
			domain_status: { id: DomainStatus.ACTIVE, label: 'Active', type: 'success' },
		};

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
