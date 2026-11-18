/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
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

// A cart helper that throws inside the pending action makes the processing step submit FAILURE.
// That must land on the error step, not in checkout with an empty or partial cart.
test( 'sends a failed processing result to the error step, not to checkout', async () => {
	const replace = jest.fn();
	window.location.replace = replace;
	const navigate = jest.fn();
	const { result } = renderHook( () =>
		domain.useStepNavigation.call( domain, 'processing', navigate )
	);

	await result.current.submit( {
		slug: 'processing',
		providedDependencies: {
			processingResult: ProcessingResult.FAILURE,
			goToCheckout: true,
			siteSlug: 'example.wordpress.com',
		},
	} );

	expect( navigate ).toHaveBeenCalledWith( 'error', { errorReason: 'processing_failed' } );
	expect( replace ).not.toHaveBeenCalled();
} );

test( 'ignores a connection setup URL on another site', async () => {
	window.location.href = `https://wordpress.com/setup/domain/use-my-domain?domainConnectionSetupUrl=${ encodeURIComponent(
		'https://evil.example/%s'
	) }`;
	const { result } = renderHook( () =>
		domain.useStepNavigation.call( domain, 'use-my-domain', jest.fn() )
	);

	await result.current.submit( {
		slug: 'use-my-domain',
		providedDependencies: { ownershipVerificationCompleted: true, domain: 'example.com' },
	} );
	expect( window.location.href ).not.toContain( 'evil.example' );
	expect( window.location.href ).toMatch( /\/sites\/example\.wordpress\.com\/domains$/ );
} );
