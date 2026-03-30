/**
 * @jest-environment jsdom
 */
import { DomainSubtype } from '@automattic/api-core';
import { isPendingPrimaryDomain } from '../is-pending-primary-domain';
import type { DomainSummary } from '@automattic/api-core';

describe( 'isPendingPrimaryDomain', () => {
	const baseDomain = {
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
		can_set_as_primary: true,
		primary_domain: false,
	} as DomainSummary;

	test( 'returns true for a registered domain that can be set as primary but is not yet primary', () => {
		expect( isPendingPrimaryDomain( baseDomain ) ).toBe( true );
	} );

	test( 'returns false when domain is already primary', () => {
		expect(
			isPendingPrimaryDomain( { ...baseDomain, primary_domain: true } as DomainSummary )
		).toBe( false );
	} );

	test( 'returns false when domain cannot be set as primary', () => {
		expect(
			isPendingPrimaryDomain( { ...baseDomain, can_set_as_primary: false } as DomainSummary )
		).toBe( false );
	} );

	test( 'returns false for non-registration domains', () => {
		expect(
			isPendingPrimaryDomain( {
				...baseDomain,
				subtype: { id: DomainSubtype.DEFAULT_ADDRESS, label: 'Default' },
			} as DomainSummary )
		).toBe( false );
	} );

	test( 'returns false for domain connections', () => {
		expect(
			isPendingPrimaryDomain( {
				...baseDomain,
				subtype: { id: DomainSubtype.DOMAIN_CONNECTION, label: 'Connection' },
			} as DomainSummary )
		).toBe( false );
	} );
} );
