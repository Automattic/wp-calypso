/**
 * @jest-environment jsdom
 */
import onboarding from '../onboarding';

const mockFetchPending = jest.fn();
const mockHasCartItems = jest.fn();
const mockAdopt = jest.fn();
const mockGoToCheckout = jest.fn();
const mockAssign = jest.fn();
let mockLoggedIn = true;

jest.mock( 'calypso/landing/stepper/utils/wow-funnel-site', () => ( {
	fetchPendingWowFunnelSite: ( ...args: unknown[] ) => mockFetchPending( ...args ),
	wowFunnelSiteHasCartItems: ( ...args: unknown[] ) => mockHasCartItems( ...args ),
	adoptWowFunnelSite: ( ...args: unknown[] ) => mockAdopt( ...args ),
	startWowFunnelSite: jest.fn(),
	forgetWowFunnelRun: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/utils/wow-funnel', () => ( {
	getWowFunnelSlug: ( params: URLSearchParams ) => params.get( 'wow_funnel' ),
	getWowFunnelArgs: () => ( {} ),
	getWowFunnelDest: () => 'editor',
	getWowFunnelConfig: () => ( { interstitials: [] } ),
	isKnownWowFunnel: ( slug: string | null ) => Boolean( slug ),
	getRememberedWowFunnelSite: () => null,
	clearWowFunnelSite: jest.fn(),
	wowFunnelSiteIsPaid: () => false,
	logWowFunnelEvent: jest.fn(),
	waitForWowFunnelReady: jest.fn(),
	getWowFunnelHandoffUrl: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/utils/checkout', () => ( {
	goToCheckout: ( ...args: unknown[] ) => mockGoToCheckout( ...args ),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: () => mockLoggedIn,
	getCurrentUser: () => null,
} ) );

jest.mock( 'calypso/state/selectors/get-current-locale-slug', () => ( {
	__esModule: true,
	default: () => 'en',
} ) );

jest.mock( 'calypso/components/domains/wpcom-domain-search/use-query-handler', () => ( {
	clearSessionStorageQuery: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {} ),
	useSelect: jest.fn( () => ( {} ) ),
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
jest.mock( '@automattic/onboarding', () => ( {
	ONBOARDING_FLOW: 'onboarding',
	SITE_SETUP_FLOW: 'site-setup',
	clearStepPersistedState: jest.fn(),
	isOnboardingFlow: ( flow: string ) => flow === 'onboarding',
} ) );
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

const PENDING = {
	blogId: 111,
	siteSlug: 'site-111.wordpress.com',
	funnelSlug: 'default',
	funnelArgs: {},
};

const store = { getState: () => ( {} ) } as never;

function enterAt( pathname: string ) {
	delete ( window as unknown as { location?: unknown } ).location;
	( window as unknown as { location: unknown } ).location = {
		pathname,
		search: '?wow_funnel=default',
		href: `http://calypso.localhost:3000${ pathname }?wow_funnel=default`,
		assign: mockAssign,
	};
}

/**
 * A customer who left an unpaid funnel site behind is put back where they stopped. This runs in
 * initialize, which the Stepper awaits before rendering, so the decision is made before any step
 * is on screen. `false` is initialize's contract for "a redirect is under way, do not start the
 * flow".
 */
describe( 'wow funnel resume', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockLoggedIn = true;
		mockAdopt.mockReturnValue( { blogId: PENDING.blogId } );
		enterAt( '/setup/onboarding' );
	} );

	it( 'sends the customer back to checkout when the abandoned cart still holds their plan', async () => {
		mockFetchPending.mockResolvedValue( PENDING );
		mockHasCartItems.mockResolvedValue( true );

		await expect( onboarding.initialize( store ) ).resolves.toBe( false );
		expect( mockGoToCheckout.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			siteSlug: PENDING.siteSlug,
		} );
	} );

	/**
	 * A resumed purchase must still land on the site the funnel built. Flow entry clears the
	 * destination cookie, so checkout is handed the destination explicitly.
	 */
	it( 'gives the resumed checkout the funnel hand-off as its destination', async () => {
		mockFetchPending.mockResolvedValue( PENDING );
		mockHasCartItems.mockResolvedValue( true );

		await onboarding.initialize( store );

		expect( mockGoToCheckout.mock.calls[ 0 ][ 0 ].destination ).toContain( 'wow-funnel-handoff' );
	} );

	it( 'sends the customer to plans when the site is standing but nothing was ever chosen', async () => {
		mockFetchPending.mockResolvedValue( PENDING );
		mockHasCartItems.mockResolvedValue( false );

		await expect( onboarding.initialize( store ) ).resolves.toBe( false );
		expect( mockAssign.mock.calls[ 0 ][ 0 ] ).toContain( '/setup/onboarding/plans' );
		expect( mockGoToCheckout ).not.toHaveBeenCalled();
	} );

	it( 'starts the flow normally when the customer has no site standing', async () => {
		mockFetchPending.mockResolvedValue( null );

		await expect( onboarding.initialize( store ) ).resolves.not.toBe( false );
		expect( mockGoToCheckout ).not.toHaveBeenCalled();
		expect( mockAssign ).not.toHaveBeenCalled();
	} );

	/**
	 * A step in the path means the customer is inside the run. Resuming there would throw them out
	 * of the step they are on — a refresh on the domain step would jump to plans.
	 */
	it( 'never resumes once a step is in the path', async () => {
		enterAt( '/setup/onboarding/domains' );
		mockFetchPending.mockResolvedValue( PENDING );
		mockHasCartItems.mockResolvedValue( true );

		await expect( onboarding.initialize( store ) ).resolves.not.toBe( false );
		expect( mockFetchPending ).not.toHaveBeenCalled();
		expect( mockGoToCheckout ).not.toHaveBeenCalled();
		expect( mockAssign ).not.toHaveBeenCalled();
	} );

	it( 'does not ask the server about a logged-out visitor', async () => {
		mockLoggedIn = false;
		mockFetchPending.mockResolvedValue( PENDING );

		await expect( onboarding.initialize( store ) ).resolves.not.toBe( false );
		expect( mockFetchPending ).not.toHaveBeenCalled();
	} );
} );
