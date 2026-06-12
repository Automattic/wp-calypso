import { DomainSubtype, WhoisType } from '@automattic/api-core';
import { findRegistrantWhois, findPrivacyServiceWhois, isPendingPrimaryDomain } from '../domain';

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

	describe( 'isPendingPrimaryDomain', () => {
		const baseDomain = {
			subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
			can_set_as_primary: true,
			primary_domain: false,
		};

		test( 'returns true for a registered domain that can be set as primary but is not yet primary', () => {
			expect( isPendingPrimaryDomain( baseDomain ) ).toBe( true );
		} );

		test( 'returns false when domain is already primary', () => {
			expect( isPendingPrimaryDomain( { ...baseDomain, primary_domain: true } ) ).toBe( false );
		} );

		test( 'returns false when domain cannot be set as primary', () => {
			expect( isPendingPrimaryDomain( { ...baseDomain, can_set_as_primary: false } ) ).toBe(
				false
			);
		} );

		test( 'returns false for non-registration domains', () => {
			expect(
				isPendingPrimaryDomain( {
					...baseDomain,
					subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: 'Default' },
				} )
			).toBe( false );
		} );

		test( 'returns false for domain connections', () => {
			expect(
				isPendingPrimaryDomain( {
					...baseDomain,
					subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Connection' },
				} )
			).toBe( false );
		} );
	} );
} );
