/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import domain from '../domain';

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteSlug: 'example.wordpress.com', site: { ID: 123 } } ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );

const SETUP_URL = 'https://my.wordpress.com/domains/%s/domain-connection-setup';

beforeEach( () => {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: {
			...window.location,
			href: `https://wordpress.com/setup/domain/use-my-domain?domainConnectionSetupUrl=${ encodeURIComponent(
				SETUP_URL
			) }`,
		},
	} );
} );

test( 'sends an existing mapping to its connection setup without failing the submission', async () => {
	const { result } = renderHook( () =>
		domain.useStepNavigation.call( domain, 'use-my-domain', jest.fn() )
	);

	await expect(
		result.current.submit( {
			slug: 'use-my-domain',
			providedDependencies: { ownershipVerificationCompleted: true, domain: 'example.com' },
		} )
	).resolves.toBeUndefined();
	expect( window.location.href ).toBe(
		'https://my.wordpress.com/domains/example.com/domain-connection-setup'
	);
} );
