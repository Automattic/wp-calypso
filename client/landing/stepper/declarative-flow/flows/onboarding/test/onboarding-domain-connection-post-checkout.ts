/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import onboarding from '../onboarding';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

let mockDomainCartItem: MinimalRequestCartProduct | undefined;
const mockFetchDomain = vi.fn();

// How the request rejects when wpcom has no record of the domain.
const unknownDomainError = () =>
	Object.assign( new Error( 'The domain specified is not hosted with us.' ), {
		name: 'InvalidDomainError',
		error: 'invalid_domain',
	} );

// The package imports itself while loading, so the real exports are read lazily rather than spread.
vi.mock( '@automattic/api-core', async () => {
	const actual = await vi.importActual< Record< string, unknown > >( '@automattic/api-core' );
	const overrides = { fetchDomain: ( ...args: unknown[] ) => mockFetchDomain( ...args ) };
	return new Proxy( actual, {
		get: ( target, key: string ) =>
			key in overrides ? overrides[ key as keyof typeof overrides ] : target[ key ],
		has: ( target, key ) => key in overrides || key in target,
	} );
} );

vi.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => ( {
	clearSessionStorageQuery: vi.fn(),
} ) );

vi.mock( '@automattic/components', () => ( {
	MaterialIcon: () => null,
	ExternalLink: () => null,
} ) );

vi.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		resetOnboardStore: vi.fn(),
		setDomain: vi.fn(),
		setDomainCartItem: vi.fn(),
		setDomainCartItems: vi.fn(),
		setPlanCartItem: vi.fn(),
		setProductCartItems: vi.fn(),
		setSiteUrl: vi.fn(),
		setSignupDomainOrigin: vi.fn(),
		setHideFreePlan: vi.fn(),
	} ),
	// Run the real selector callback against a stubbed store so the flow's own
	// `getDomainCartItem` call is what feeds the test, not a hand-built result.
	useSelect: vi.fn( ( selector: ( select: ( store: string ) => unknown ) => unknown ) =>
		selector( () => ( {
			getSignupDomainOrigin: () => undefined,
			getPlanCartItem: () => null,
			getDomainCartItem: () => mockDomainCartItem,
			getDomainCartItems: () => undefined,
			getBlueprint: () => undefined,
		} ) )
	),
	resolveSelect: vi.fn( () => ( { getSite: async () => ( { options: {} } ) } ) ),
} ) );

vi.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: vi.fn( () => new URLSearchParams( '' ) ),
} ) );

vi.mock( 'calypso/landing/stepper/hooks/use-flow-locale', () => ( {
	useFlowLocale: vi.fn( () => 'en' ),
} ) );

vi.mock( 'calypso/state', () => ( {
	useSelector: vi.fn(),
	useDispatch: () => vi.fn(),
} ) );

vi.mock( 'calypso/lib/analytics/survicate', () => ( { addSurvicate: vi.fn() } ) );
vi.mock( 'calypso/lib/analytics/signup', () => ( { SIGNUP_DOMAIN_ORIGIN: {} } ) );
vi.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: vi.fn(),
	useExperiment: vi.fn( () => [ false, null ] ),
} ) );

vi.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

vi.mock( '@automattic/data-stores', () => ( {} ) );

vi.mock(
	'calypso/landing/stepper/declarative-flow/internals/hooks/use-purchase-plan-notification',
	() => ( {
		usePurchasePlanNotification: vi.fn( () => ( { setShouldShowNotification: vi.fn() } ) ),
	} )
);

vi.mock( 'calypso/signup/storageUtils', () => ( {
	persistSignupDestination: vi.fn(),
	setSignupCompleteFlowName: vi.fn(),
	setSignupCompleteSlug: vi.fn(),
	clearSignupCompleteSlug: vi.fn(),
	clearSignupCompleteFlowName: vi.fn(),
	clearSignupDestinationCookie: vi.fn(),
	clearSignupCompleteSiteID: vi.fn(),
} ) );

vi.mock( '@automattic/onboarding', () => ( {
	NEW_HOSTED_SITE_FLOW: 'new-hosted-site',
	ONBOARDING_FLOW: 'onboarding',
	SITE_SETUP_FLOW: 'site-setup',
	clearStepPersistedState: vi.fn(),
	isOnboardingFlow: ( flow: string ) => flow === 'onboarding',
} ) );

vi.mock( 'calypso/lib/url', () => ( { pathToUrl: ( path: string ) => path } ) );

vi.mock( 'calypso/dashboard/utils/link', () => ( {
	dashboardLink: ( path: string ) => `https://my.wordpress.com${ path }`,
} ) );

vi.mock( '../../../helpers/get-onboarding-post-checkout-destination', () => ( {
	getOnboardingPostCheckoutDestination: vi.fn( () => [
		'/home/example.wordpress.com',
		null,
		null,
	] ),
} ) );

vi.mock( '../step-counter-config', () => ( {
	getOnboardingStepperPosition: () => ( { current: 3, total: 3 } ),
} ) );

// Runs the `processing` case for a successful order that has already been through checkout,
// i.e. the return leg from post-checkout-onboarding. Returns the navigate spy and the URL
// handed to `window.location.replace`, if any.
const submitPostCheckoutProcessing = async ( providedDependencies: Record< string, unknown > ) => {
	const replace = vi.fn();
	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { href: 'http://localhost/', search: '', replace },
	} );

	try {
		const navigate = vi.fn();
		const { result } = renderHook( () =>
			onboarding.useStepNavigation.call(
				onboarding,
				'processing' as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
				navigate
			)
		);

		await result.current.submit?.( {
			slug: 'processing',
			providedDependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteSlug: 'example.wordpress.com',
				siteId: 123,
				...providedDependencies,
			},
		} as Parameters< NonNullable< typeof result.current.submit > >[ 0 ] );

		return { navigate, replacedWith: replace.mock.calls[ 0 ]?.[ 0 ] as string | undefined };
	} finally {
		if ( originalLocation ) {
			Object.defineProperty( window, 'location', originalLocation );
		}
	}
};

describe( 'onboarding post-checkout destination for a connected domain', () => {
	beforeEach( () => {
		mockDomainCartItem = undefined;
		vi.clearAllMocks();
		mockFetchDomain.mockResolvedValue( { domain: 'example.com', blog_id: 123 } );
	} );

	it( 'sends a connected domain to the domain connection setup instead of the setup chooser', async () => {
		mockDomainCartItem = { product_slug: 'domain_map', meta: 'example.com' };

		const { navigate, replacedWith } = await submitPostCheckoutProcessing( {
			postCheckoutBigSky: true,
		} );

		expect( replacedWith ).toBe(
			'https://my.wordpress.com/domains/example.com/domain-connection-setup'
		);
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'sends a connected domain to the domain connection setup instead of My Home', async () => {
		mockDomainCartItem = { product_slug: 'domain_map', meta: 'example.com' };

		const { replacedWith } = await submitPostCheckoutProcessing( {} );

		expect( replacedWith ).toBe(
			'https://my.wordpress.com/domains/example.com/domain-connection-setup'
		);
	} );

	it( 'sends a transferred domain to the domain transfer setup instead of the setup chooser', async () => {
		mockDomainCartItem = { product_slug: 'domain_transfer', meta: 'example.com' };

		const { navigate, replacedWith } = await submitPostCheckoutProcessing( {
			postCheckoutBigSky: true,
		} );

		expect( replacedWith ).toBe(
			'https://my.wordpress.com/domains/example.com/domain-transfer-setup'
		);
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'sends a transferred domain to the domain transfer setup instead of My Home', async () => {
		mockDomainCartItem = { product_slug: 'domain_transfer', meta: 'example.com' };

		const { replacedWith } = await submitPostCheckoutProcessing( {} );

		expect( replacedWith ).toBe(
			'https://my.wordpress.com/domains/example.com/domain-transfer-setup'
		);
	} );

	it( 'keeps the setup chooser for a transferred domain that wpcom has no record of', async () => {
		mockDomainCartItem = { product_slug: 'domain_transfer', meta: 'example.com' };
		mockFetchDomain.mockRejectedValue( unknownDomainError() );

		const { navigate, replacedWith } = await submitPostCheckoutProcessing( {
			postCheckoutBigSky: true,
		} );

		expect( mockFetchDomain ).toHaveBeenCalledWith( 'example.com' );
		expect( navigate ).toHaveBeenCalledWith( 'setup-your-site-ai' );
		expect( replacedWith ).toBeUndefined();
	} );

	it( 'keeps the setup chooser for a connected domain that wpcom has no record of', async () => {
		mockDomainCartItem = { product_slug: 'domain_map', meta: 'example.com' };
		mockFetchDomain.mockRejectedValue( unknownDomainError() );

		const { navigate, replacedWith } = await submitPostCheckoutProcessing( {
			postCheckoutBigSky: true,
		} );

		expect( mockFetchDomain ).toHaveBeenCalledWith( 'example.com' );
		expect( navigate ).toHaveBeenCalledWith( 'setup-your-site-ai' );
		expect( replacedWith ).toBeUndefined();
	} );

	it( 'keeps My Home for a connected domain that wpcom has no record of', async () => {
		mockDomainCartItem = { product_slug: 'domain_map', meta: 'example.com' };
		mockFetchDomain.mockRejectedValue( unknownDomainError() );

		const { replacedWith } = await submitPostCheckoutProcessing( {} );

		expect( replacedWith ).toBe( '/home/example.wordpress.com' );
	} );

	it( 'sends a connected domain to its setup when the domain request fails for another reason', async () => {
		mockDomainCartItem = { product_slug: 'domain_map', meta: 'example.com' };
		mockFetchDomain.mockRejectedValue( new Error( 'Network error' ) );

		const { replacedWith } = await submitPostCheckoutProcessing( {} );

		expect( replacedWith ).toBe(
			'https://my.wordpress.com/domains/example.com/domain-connection-setup'
		);
	} );

	it( 'keeps My Home for a connected domain that is on another site', async () => {
		mockDomainCartItem = { product_slug: 'domain_map', meta: 'example.com' };
		mockFetchDomain.mockResolvedValue( { domain: 'example.com', blog_id: 999 } );

		const { replacedWith } = await submitPostCheckoutProcessing( {} );

		expect( replacedWith ).toBe( '/home/example.wordpress.com' );
	} );

	it( 'keeps My Home for a connected domain when wpcom refuses the domain request', async () => {
		mockDomainCartItem = { product_slug: 'domain_map', meta: 'example.com' };
		mockFetchDomain.mockRejectedValue(
			Object.assign( new Error( 'Forbidden' ), { name: 'UnauthorizedError', status: 403 } )
		);

		const { replacedWith } = await submitPostCheckoutProcessing( {} );

		expect( replacedWith ).toBe( '/home/example.wordpress.com' );
	} );

	it( 'sends a connected domain to its setup when the domain request stalls', async () => {
		mockDomainCartItem = { product_slug: 'domain_map', meta: 'example.com' };
		mockFetchDomain.mockReturnValue( new Promise( () => undefined ) );
		vi.useFakeTimers();

		try {
			const pending = submitPostCheckoutProcessing( {} );
			await vi.advanceTimersByTimeAsync( 5000 );
			const { replacedWith } = await pending;

			expect( replacedWith ).toBe(
				'https://my.wordpress.com/domains/example.com/domain-connection-setup'
			);
		} finally {
			vi.useRealTimers();
		}
	} );

	it( 'keeps the setup chooser for a registered domain', async () => {
		mockDomainCartItem = { product_slug: 'domain_reg', meta: 'example.com' };

		const { navigate, replacedWith } = await submitPostCheckoutProcessing( {
			postCheckoutBigSky: true,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'setup-your-site-ai' );
		expect( replacedWith ).toBeUndefined();
		expect( mockFetchDomain ).not.toHaveBeenCalled();
	} );

	it( 'keeps the setup chooser when no domain is in the cart', async () => {
		const { navigate, replacedWith } = await submitPostCheckoutProcessing( {
			postCheckoutBigSky: true,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'setup-your-site-ai' );
		expect( replacedWith ).toBeUndefined();
		expect( mockFetchDomain ).not.toHaveBeenCalled();
	} );
} );
