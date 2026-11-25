/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import onboarding from '../onboarding';

const mockGetBuildWowSiteIdentifier = vi.fn();
const mockRequestBuildWowSite = vi.fn();

vi.mock( 'calypso/landing/stepper/utils/build-wow', async () => ( {
	...( await vi.importActual< typeof import( 'calypso/landing/stepper/utils/build-wow' ) >(
		'calypso/landing/stepper/utils/build-wow'
	) ),
	getBuildWowSiteIdentifier: ( ...args: unknown[] ) => mockGetBuildWowSiteIdentifier( ...args ),
	requestBuildWowSite: ( ...args: unknown[] ) => mockRequestBuildWowSite( ...args ),
	logBuildWowEvent: vi.fn(),
} ) );

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
			getDomainCartItem: () => undefined,
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

type Submit = NonNullable< ReturnType< typeof onboarding.useStepNavigation >[ 'submit' ] >;

// Submits `slug` with `providedDependencies` and returns the navigate spy.
const submitStep = async ( slug: string, providedDependencies: Record< string, unknown > = {} ) => {
	const navigate = vi.fn();
	const { result } = renderHook( () =>
		onboarding.useStepNavigation.call(
			onboarding,
			slug as Parameters< typeof onboarding.useStepNavigation >[ 0 ],
			navigate
		)
	);

	await result.current.submit?.( { slug, providedDependencies } as Parameters< Submit >[ 0 ] );

	return navigate;
};

describe( 'onboarding navigations to the error step', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'labels a failed WoW funnel handoff', async () => {
		const navigate = await submitStep( 'wow-funnel-handoff' );

		expect( navigate ).toHaveBeenCalledWith( 'error', {
			errorReason: 'wow_funnel_handoff_failed',
		} );
	} );

	it( 'labels a build-wow start without a site', async () => {
		mockGetBuildWowSiteIdentifier.mockReturnValue( undefined );

		const navigate = await submitStep( 'setup-your-site-ai', { setupChoice: 'generate-theme' } );

		expect( mockRequestBuildWowSite ).not.toHaveBeenCalled();
		expect( navigate ).toHaveBeenCalledWith( 'error', { errorReason: 'build_wow_missing_site' } );
	} );

	it( 'labels a build-wow start that failed', async () => {
		mockGetBuildWowSiteIdentifier.mockReturnValue( 'example.wordpress.com' );
		mockRequestBuildWowSite.mockRejectedValue( new Error( 'Request failed' ) );

		const navigate = await submitStep( 'setup-your-site-ai', {
			setupChoice: 'generate-theme',
			siteSlug: 'example.wordpress.com',
		} );

		expect( navigate ).toHaveBeenCalledWith( 'error', { errorReason: 'build_wow_start_failed' } );
	} );

	it.each( [
		[
			'a site that is not a store',
			Object.assign( new Error( 'Not eligible' ), { code: 'site_not_eligible' } ),
			{},
		],
		[ 'a store for another reason', new Error( 'Request failed' ), { buildsStore: true } ],
	] )( 'labels a build-wow start that turned away %s', async ( _label, error, dependencies ) => {
		mockGetBuildWowSiteIdentifier.mockReturnValue( 'example.wordpress.com' );
		mockRequestBuildWowSite.mockRejectedValue( error );

		const navigate = await submitStep( 'setup-your-site-ai', {
			setupChoice: 'generate-theme',
			siteSlug: 'example.wordpress.com',
			...dependencies,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'error', { errorReason: 'build_wow_start_failed' } );
	} );

	it( 'labels a failed processing result and replaces processing so Back does not re-run it', async () => {
		const navigate = await submitStep( 'processing', {
			processingResult: ProcessingResult.FAILURE,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'error', { errorReason: 'processing_failed' }, true );
	} );

	it( 'labels a processing result with no pending action and no siteSlug', async () => {
		const navigate = await submitStep( 'processing', {
			processingResult: ProcessingResult.NO_ACTION,
		} );

		expect( navigate ).toHaveBeenCalledWith(
			'error',
			{ errorReason: 'processing_no_action' },
			true
		);
	} );
} );

describe( 'onboarding build-wow site spec hand-off', () => {
	const originalLocation = window.location;
	const assign = vi.fn();

	beforeEach( () => {
		vi.clearAllMocks();
		mockGetBuildWowSiteIdentifier.mockReturnValue( 'example.wordpress.com' );
		mockRequestBuildWowSite.mockResolvedValue( {} );
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { ...originalLocation, assign },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', { configurable: true, value: originalLocation } );
	} );

	const getSpecSiteId = () =>
		new URL( assign.mock.calls[ 0 ][ 0 ], 'http://x' ).searchParams.get( 'siteId' );

	it( 'passes on the site ID the chooser submitted', async () => {
		await submitStep( 'setup-your-site-ai', {
			setupChoice: 'generate-theme',
			siteSlug: 'example.wordpress.com',
			siteId: 123,
		} );

		expect( getSpecSiteId() ).toBe( '123' );
	} );

	// The chooser can submit with siteId 0: the site store cannot match an Atomic
	// site to its wordpress.com slug.
	it( 'takes the site ID from the build-wow start when the chooser submitted none', async () => {
		mockRequestBuildWowSite.mockResolvedValue( { blog_id: 456 } );

		await submitStep( 'setup-your-site-ai', {
			setupChoice: 'generate-theme',
			siteSlug: 'example.wordpress.com',
			siteId: 0,
		} );

		expect( getSpecSiteId() ).toBe( '456' );
	} );

	it( 'opens the legacy builder when build-wow turns a store away', async () => {
		mockRequestBuildWowSite.mockRejectedValue(
			Object.assign( new Error( 'Not eligible' ), { code: 'site_not_eligible' } )
		);

		const navigate = await submitStep( 'setup-your-site-ai', {
			setupChoice: 'generate-theme',
			siteSlug: 'example.wordpress.com',
			siteId: 123,
			buildsStore: true,
		} );

		expect( navigate ).not.toHaveBeenCalled();
		const builderUrl = new URL( assign.mock.calls[ 0 ][ 0 ], 'http://x' );
		expect( builderUrl.pathname ).toBe( '/setup/site-setup/launch-big-sky' );
		expect( builderUrl.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( builderUrl.searchParams.get( 'siteId' ) ).toBe( '123' );
	} );
} );
