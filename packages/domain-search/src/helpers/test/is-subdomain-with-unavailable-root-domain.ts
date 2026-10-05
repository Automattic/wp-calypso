import { DomainAvailabilityStatus } from '@automattic/api-core';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { isSubdomainWithUnavailableRootDomain } from '../is-subdomain-with-unavailable-root-domain';

// For a subdomain query the backend returns the ROOT in `domain_name` (and computes
// `status` against it), so these fixtures use the root for `domain_name` and pass the
// searched subdomain as the second argument, matching the real API response.
describe( 'isSubdomainWithUnavailableRootDomain', () => {
	test( 'returns true for a subdomain whose root domain is mapped', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'example.com',
					status: DomainAvailabilityStatus.MAPPED,
				} ),
				'cms.example.com'
			)
		).toBe( true );
	} );

	test( 'returns true for a subdomain whose root domain is registered by another user', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'example.com',
					status: DomainAvailabilityStatus.REGISTERED,
				} ),
				'cms.example.com'
			)
		).toBe( true );
	} );

	test( "returns false for the user's own already-mapped subdomain (mappable is ignored)", () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'example.com',
					status: DomainAvailabilityStatus.MAPPABLE,
					mappable: DomainAvailabilityStatus.MAPPED,
				} ),
				'cms.example.com'
			)
		).toBe( false );
	} );

	test( 'returns false when the response describes the subdomain itself (root not on WordPress.com)', () => {
		// The backend leaves `domain_name` as the searched subdomain (rather than
		// swapping it to the root) when the root has no WordPress.com presence, so the
		// mapped status is the user's own subdomain, not another account's root.
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'cms.example.com',
					status: DomainAvailabilityStatus.MAPPED,
				} ),
				'cms.example.com'
			)
		).toBe( false );
	} );

	test( 'returns false when the searched name is a root domain, not a subdomain', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'example.com',
					status: DomainAvailabilityStatus.MAPPED,
				} ),
				'example.com'
			)
		).toBe( false );
	} );

	test( 'returns false for a subdomain connected under the same account', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'example.com',
					status: DomainAvailabilityStatus.MAPPED_SAME_SITE_REGISTRABLE,
				} ),
				'cms.example.com'
			)
		).toBe( false );
	} );

	test( 'returns false for a subdomain that is not mapped', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'example.com',
					status: DomainAvailabilityStatus.MAPPABLE,
					mappable: DomainAvailabilityStatus.MAPPABLE,
				} ),
				'cms.example.com'
			)
		).toBe( false );
	} );
} );
