import { DomainAvailabilityStatus } from '@automattic/api-core';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { isSubdomainWithMappedRootDomain } from '../is-subdomain-with-mapped-root-domain';

describe( 'isSubdomainWithMappedRootDomain', () => {
	test( 'returns true for a subdomain whose root domain is mapped', () => {
		expect(
			isSubdomainWithMappedRootDomain(
				buildAvailability( {
					domain_name: 'cms.example.com',
					status: DomainAvailabilityStatus.MAPPED,
				} )
			)
		).toBe( true );
	} );

	test( 'returns true for a subdomain whose root domain is registered by another user', () => {
		expect(
			isSubdomainWithMappedRootDomain(
				buildAvailability( {
					domain_name: 'cms.example.com',
					status: DomainAvailabilityStatus.REGISTERED,
				} )
			)
		).toBe( true );
	} );

	test( "returns false for the user's own already-mapped subdomain (mappable is ignored)", () => {
		expect(
			isSubdomainWithMappedRootDomain(
				buildAvailability( {
					domain_name: 'cms.example.com',
					status: DomainAvailabilityStatus.MAPPABLE,
					mappable: DomainAvailabilityStatus.MAPPED,
				} )
			)
		).toBe( false );
	} );

	test( 'returns false for a root domain that is mapped', () => {
		expect(
			isSubdomainWithMappedRootDomain(
				buildAvailability( {
					domain_name: 'example.com',
					status: DomainAvailabilityStatus.MAPPED,
				} )
			)
		).toBe( false );
	} );

	test( 'returns false for a subdomain connected under the same account', () => {
		expect(
			isSubdomainWithMappedRootDomain(
				buildAvailability( {
					domain_name: 'cms.example.com',
					status: DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE,
				} )
			)
		).toBe( false );
	} );

	test( 'returns false for a subdomain that is not mapped', () => {
		expect(
			isSubdomainWithMappedRootDomain(
				buildAvailability( {
					domain_name: 'cms.example.com',
					status: DomainAvailabilityStatus.MAPPABLE,
					mappable: DomainAvailabilityStatus.MAPPABLE,
				} )
			)
		).toBe( false );
	} );
} );
