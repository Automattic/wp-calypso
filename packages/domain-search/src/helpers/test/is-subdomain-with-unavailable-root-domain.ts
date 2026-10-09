import { buildAvailability } from '../../test-helpers/factories/availability';
import { isSubdomainWithUnavailableRootDomain } from '../is-subdomain-with-unavailable-root-domain';

describe( 'isSubdomainWithUnavailableRootDomain', () => {
	test( 'returns true for a subdomain whose root is owned by another user', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'cms.example.com',
					root_domain_owned_by_other_user: true,
				} ),
				'cms.example.com'
			)
		).toBe( true );
	} );

	test( 'returns false when the root is not owned by another user', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'cms.example.com',
					root_domain_owned_by_other_user: false,
				} ),
				'cms.example.com'
			)
		).toBe( false );
	} );

	test( 'returns false when the flag is absent', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( { domain_name: 'cms.example.com' } ),
				'cms.example.com'
			)
		).toBe( false );
	} );

	test( 'returns false when the searched name is not a subdomain', () => {
		expect(
			isSubdomainWithUnavailableRootDomain(
				buildAvailability( {
					domain_name: 'example.com',
					root_domain_owned_by_other_user: true,
				} ),
				'example.com'
			)
		).toBe( false );
	} );
} );
