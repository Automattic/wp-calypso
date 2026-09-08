/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import onboarding from '../onboarding';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

let mockDomainCartItem: MinimalRequestCartProduct | undefined;

jest.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => ( {
	clearSessionStorageQuery: jest.fn(),
} ) );

jest.mock( '@automattic/components', () => ( {
	MaterialIcon: () => null,
	ExternalLink: () => null,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		resetOnboardStore: jest.fn(),
		setDomain: jest.fn(),
		setDomainCartItem: jest.fn(),
		setDomainCartItems: jest.fn(),
		setPlanCartItem: jest.fn(),
		setProductCartItems: jest.fn(),
		setSiteUrl: jest.fn(),
		setSignupDomainOrigin: jest.fn(),
		setHideFreePlan: jest.fn(),
	} ),
	// Run the real selector callback against a stubbed store so the flow's own
	// `getDomainCartItem` call is what feeds the test, not a hand-built result.
	useSelect: jest.fn( ( selector: ( select: ( store: string ) => unknown ) => unknown ) =>
		selector( () => ( {
			getSignupDomainOrigin: () => undefined,
			getPlanCartItem: () => null,
			getDomainCartItem: () => mockDomainCartItem,
			getBlueprint: () => undefined,
		} ) )
	),
	resolveSelect: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: jest.fn( () => new URLSearchParams( '' ) ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale', () => ( {
	useFlowLocale: jest.fn( () => 'en' ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/survicate', () => ( { addSurvicate: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/signup', () => ( { SIGNUP_DOMAIN_ORIGIN: {} } ) );
jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
	useExperiment: jest.fn( () => [ false, null ] ),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( '@automattic/data-stores', () => ( {} ) );

jest.mock(
	'calypso/landing/stepper/declarative-flow/internals/hooks/use-purchase-plan-notification',
	() => ( {
		usePurchasePlanNotification: jest.fn( () => ( { setShouldShowNotification: jest.fn() } ) ),
	} )
);

jest.mock( 'calypso/signup/storageUtils', () => ( {
	persistSignupDestination: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	ONBOARDING_FLOW: 'onboarding',
	SITE_SETUP_FLOW: 'site-setup',
	clearStepPersistedState: jest.fn(),
	isOnboardingFlow: ( flow: string ) => flow === 'onboarding',
} ) );

jest.mock( 'calypso/lib/ai-launchpad', () => ( {
	resolveLaunchpadPersonalizationVariation: jest.fn( async () => 'control' ),
	getLaunchpadPersonalizationDestination: jest.fn(),
} ) );

jest.mock( 'calypso/lib/url', () => ( { pathToUrl: ( path: string ) => path } ) );

jest.mock( 'calypso/dashboard/utils/link', () => ( {
	dashboardLink: ( path: string ) => `https://my.wordpress.com${ path }`,
} ) );

jest.mock( '../../../helpers/get-onboarding-post-checkout-destination', () => ( {
	getOnboardingPostCheckoutDestination: jest.fn( () => [
		'/home/example.wordpress.com',
		null,
		null,
	] ),
} ) );

jest.mock( '../step-counter-config', () => ( {
	getOnboardingStepperPosition: () => ( { current: 3, total: 3 } ),
} ) );

// Runs the `processing` case for a successful order that has already been through checkout,
// i.e. the return leg from post-checkout-onboarding. Returns the navigate spy and the URL
// handed to `window.location.replace`, if any.
const submitPostCheckoutProcessing = async ( providedDependencies: Record< string, unknown > ) => {
	const replace = jest.fn();
	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { href: 'http://localhost/', search: '', replace },
	} );

	try {
		const navigate = jest.fn();
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
		jest.clearAllMocks();
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

	it( 'keeps the setup chooser for a registered domain', async () => {
		mockDomainCartItem = { product_slug: 'domain_reg', meta: 'example.com' };

		const { navigate, replacedWith } = await submitPostCheckoutProcessing( {
			postCheckoutBigSky: true,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'setup-your-site-ai' );
		expect( replacedWith ).toBeUndefined();
	} );

	it( 'keeps the setup chooser when no domain is in the cart', async () => {
		const { navigate, replacedWith } = await submitPostCheckoutProcessing( {
			postCheckoutBigSky: true,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'setup-your-site-ai' );
		expect( replacedWith ).toBeUndefined();
	} );
} );
