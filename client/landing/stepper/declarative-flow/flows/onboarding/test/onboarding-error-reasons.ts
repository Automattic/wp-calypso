/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import onboarding from '../onboarding';

const mockGetBuildWowSiteIdentifier = jest.fn();
const mockRequestBuildWowSite = jest.fn();

jest.mock( 'calypso/landing/stepper/utils/build-wow', () => ( {
	...jest.requireActual( 'calypso/landing/stepper/utils/build-wow' ),
	getBuildWowSiteIdentifier: ( ...args: unknown[] ) => mockGetBuildWowSiteIdentifier( ...args ),
	requestBuildWowSite: ( ...args: unknown[] ) => mockRequestBuildWowSite( ...args ),
	logBuildWowEvent: jest.fn(),
} ) );

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
			getDomainCartItem: () => undefined,
			getBlueprint: () => undefined,
		} ) )
	),
	resolveSelect: jest.fn( () => ( { getSite: async () => ( { options: {} } ) } ) ),
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

type Submit = NonNullable< ReturnType< typeof onboarding.useStepNavigation >[ 'submit' ] >;

// Submits `slug` with `providedDependencies` and returns the navigate spy.
const submitStep = async ( slug: string, providedDependencies: Record< string, unknown > = {} ) => {
	const navigate = jest.fn();
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
		jest.clearAllMocks();
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

	it( 'labels a failed processing result', async () => {
		const navigate = await submitStep( 'processing', {
			processingResult: ProcessingResult.FAILURE,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'error', { errorReason: 'processing_failed' } );
	} );

	it( 'labels a processing result with no pending action and no siteSlug', async () => {
		const navigate = await submitStep( 'processing', {
			processingResult: ProcessingResult.NO_ACTION,
		} );

		expect( navigate ).toHaveBeenCalledWith( 'error', { errorReason: 'processing_no_action' } );
	} );
} );

describe( 'onboarding build-wow site spec hand-off', () => {
	const originalLocation = window.location;
	const assign = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
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
} );
