/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import hosting from '../new-hosted-site-flow';
import type { BaseNavigationControls } from '../../../internals/types';

jest.mock( '@automattic/onboarding', () => ( {
	NEW_HOSTED_SITE_FLOW: 'new-hosted-site',
	clearStepPersistedState: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( { ONBOARD_STORE: 'ONBOARD_STORE' } ) );

let mockQuery = new URLSearchParams();
let mockLocale = 'en';
let mockTrialPlan = false;
let mockValidPlan = true;
let mockEligibleForTrial = true;
let mockPlan: { product_slug: string } | null = { product_slug: 'ecommerce-bundle-2y' };
const mockReset = jest.fn();
const mockSeed = jest.fn();
const mockClear = jest.fn();
const mockReduxDispatch = jest.fn();
const mockSite = { siteSlug: 'example.wordpress.com', siteId: '123' };

jest.mock( '@automattic/calypso-products', () => ( {
	isDotComPlan: () => mockValidPlan,
	isFreeHostingTrial: () => mockTrialPlan,
} ) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockReduxDispatch,
	useSelector: () => mockEligibleForTrial,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: () => unknown ) => unknown ) =>
		callback( () => ( { getPlanCartItem: () => mockPlan, getCouponCode: () => '' } ) ),
	useDispatch: () => ( {
		setDomain: jest.fn(),
		setDomainCartItem: jest.fn(),
		setDomainCartItems: jest.fn(),
		setSiteUrl: jest.fn(),
		setSignupDomainOrigin: jest.fn(),
		setPlanCartItem: mockSeed,
	} ),
	dispatch: () => ( { resetOnboardStore: mockReset, setPlanCartItem: mockSeed } ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( { useQuery: () => mockQuery } ) );
jest.mock( 'calypso/landing/stepper/utils/preselected-plan', () => ( {
	shouldSkipPlansStep: ( query: URLSearchParams, cart: { product_slug: string } | null ) =>
		!! query.get( 'plan' ) && query.get( 'plan' ) === cart?.product_slug,
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-flow-locale', () => ( {
	useFlowLocale: () => mockLocale,
} ) );
jest.mock( 'calypso/landing/stepper/utils/get-current-query-params', () => ( {
	getCurrentQueryParams: () => mockQuery,
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-is-valid-woo-partner', () => ( {
	useIsValidWooPartner: () => false,
} ) );
jest.mock( 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial', () => ( {
	isUserEligibleForFreeHostingTrial: () => mockEligibleForTrial,
} ) );
jest.mock( 'calypso/lib/url', () => ( {
	...jest.requireActual( 'calypso/lib/url' ),
	pathToUrl: ( path: string ) => `https://wordpress.com${ path }`,
} ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteSiteID: () => mockSite.siteId,
	getSignupCompleteSlug: () => mockSite.siteSlug,
	clearSignupDestinationCookie: () => mockClear(),
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
	setSignupCompleteSiteID: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	persistSignupDestination: jest.fn(),
} ) );

beforeEach( () => {
	jest.clearAllMocks();
	mockLocale = 'en';
	mockTrialPlan = false;
	mockValidPlan = true;
	mockEligibleForTrial = true;
	mockPlan = { product_slug: 'ecommerce-bundle-2y' };
	mockQuery = new URLSearchParams( {
		plan: mockPlan.product_slug,
		showPurchaseSteps: 'true',
		showDomainStep: '',
	} );
	Object.defineProperty( window, 'location', {
		value: {
			...window.location,
			pathname: '/setup/new-hosted-site/domains',
			assign: jest.fn(),
			replace: jest.fn(),
		},
		writable: true,
	} );
} );

const sideEffect = ( step: string ) =>
	renderHook( ( { stepSlug } ) => hosting.useSideEffect?.( stepSlug as never, jest.fn() ), {
		initialProps: { stepSlug: step },
	} );

const navigation = ( step: string, navigate = jest.fn() ) =>
	renderHook( () => hosting.useStepNavigation( step as never, navigate ) ).result
		.current as ReturnType< typeof hosting.useStepNavigation > & BaseNavigationControls;

it.each( [ 'en', 'fr' ] )( 'passes checkout steps and a domain return URL in %s', ( locale ) => {
	mockLocale = locale;
	mockQuery.set( 'plan', mockPlan!.product_slug );
	const nav = navigation( 'processing' );
	act( () =>
		nav.submit( {
			slug: 'processing',
			providedDependencies: {
				processingResult: ProcessingResult.SUCCESS,
				...mockSite,
				goToCheckout: true,
			},
		} as never )
	);
	const checkout = new URL(
		jest.mocked( window.location.replace ).mock.calls[ 0 ][ 0 ] as string,
		'https://wordpress.com'
	);
	expect( checkout.searchParams.get( 'steps_current' ) ).toBe( '2' );
	expect( checkout.searchParams.get( 'steps_total' ) ).toBe( '2' );
	const back = new URL( checkout.searchParams.get( 'checkoutBackUrl' )! );
	expect( back.origin ).toBe( 'https://wordpress.com' );
	expect( back.pathname ).toBe( `/setup/new-hosted-site/domains${ locale === 'en' ? '' : '/fr' }` );
	expect( back.searchParams.has( 'plan' ) ).toBe( false );
	expect( back.searchParams.get( 'siteSlug' ) ).toBe( mockSite.siteSlug );
	expect( back.searchParams.has( 'showDomainStep' ) ).toBe( true );
	expect( back.searchParams.get( 'showPurchaseSteps' ) ).toBe( 'true' );
	expect( checkout.searchParams.get( 'checkoutBackUrlDomains' ) ).toBe( back.href );
	expect( checkout.searchParams.has( 'showDomainStep' ) ).toBe( true );
	expect( checkout.searchParams.get( 'redirect_to' ) ).toContain(
		'/setup/transferring-hosted-site'
	);
} );

it( 'keeps other Commerce entries on their existing checkout behavior', () => {
	mockQuery.delete( 'showPurchaseSteps' );
	const nav = navigation( 'processing' );
	act( () =>
		nav.submit( {
			slug: 'processing',
			providedDependencies: {
				processingResult: ProcessingResult.SUCCESS,
				...mockSite,
				goToCheckout: true,
			},
		} as never )
	);
	const checkout = new URL(
		jest.mocked( window.location.assign ).mock.calls[ 0 ][ 0 ] as string,
		'https://wordpress.com'
	);
	expect( checkout.searchParams.has( 'showPurchaseSteps' ) ).toBe( false );
	expect( checkout.searchParams.has( 'checkoutBackUrl' ) ).toBe( false );
} );

it( 'keeps existing navigation after choosing a plan from the grid without progress', () => {
	mockQuery.delete( 'plan' );
	mockQuery.delete( 'showPurchaseSteps' );
	const navigate = jest.fn();
	const nav = navigation( 'domains', navigate );
	act( () => nav.submit( { slug: 'domains', providedDependencies: { domainCart: [] } } as never ) );
	expect( navigate ).toHaveBeenLastCalledWith( STEPS.SITE_CREATION_STEP.slug );
} );

it( 'keeps the plan step when a visit chooses its plan from the grid', () => {
	mockQuery.delete( 'plan' );
	const navigate = jest.fn();
	mockPlan = null;
	const domainNav = navigation( 'domains', navigate );
	act( () =>
		domainNav.submit( {
			slug: 'domains',
			providedDependencies: { domainCart: [] },
		} as never )
	);
	expect( navigate ).toHaveBeenLastCalledWith( STEPS.UNIFIED_PLANS.slug );

	mockPlan = { product_slug: 'ecommerce-bundle' };
	const nav = navigation( 'processing' );
	act( () =>
		nav.submit( {
			slug: 'processing',
			providedDependencies: {
				processingResult: ProcessingResult.SUCCESS,
				...mockSite,
				goToCheckout: true,
			},
		} as never )
	);
	const checkout = new URL(
		jest.mocked( window.location.replace ).mock.calls[ 0 ][ 0 ] as string,
		'https://wordpress.com'
	);
	expect( checkout.searchParams.get( 'steps_total' ) ).toBe( '3' );
	expect( new URL( checkout.searchParams.get( 'checkoutBackUrl' )! ).pathname ).toBe(
		'/setup/new-hosted-site/plans'
	);
	expect( new URL( checkout.searchParams.get( 'checkoutBackUrlDomains' )! ).pathname ).toBe(
		'/setup/new-hosted-site/domains'
	);
	for ( const parameter of [ 'checkoutBackUrl', 'checkoutBackUrlDomains' ] ) {
		const back = new URL( checkout.searchParams.get( parameter )! );
		expect( back.searchParams.get( 'siteSlug' ) ).toBe( mockSite.siteSlug );
		expect( back.searchParams.has( 'plan' ) ).toBe( false );
	}
} );

it.each( [ true, false ] )(
	'uses the existing site-creation path with progress=%s',
	( enabled ) => {
		mockQuery.set( 'showPurchaseSteps', String( enabled ) );
		const navigate = jest.fn();
		const nav = navigation( 'domains', navigate );
		act( () =>
			nav.submit( { slug: 'domains', providedDependencies: { domainCart: [] } } as never )
		);
		expect( navigate ).toHaveBeenLastCalledWith( STEPS.SITE_CREATION_STEP.slug );
		act( () => nav.submit( { slug: 'create-site', providedDependencies: {} } as never ) );
		expect( navigate ).toHaveBeenLastCalledWith( STEPS.PROCESSING.slug, undefined, enabled );
	}
);

it.each( [ 'domains', 'plans' ] )(
	'preserves signup state on opted-in %s entries without checkout markers',
	async ( step ) => {
		window.location.pathname = '/a-different-route-format';
		await hosting.initialize( { dispatch: jest.fn(), getState: () => ( {} ) } as never );
		sideEffect( step );
		expect( mockReset ).not.toHaveBeenCalled();
		expect( mockClear ).not.toHaveBeenCalled();
	}
);

it( 'returns through plans on the same site without reseeding the entry plan', async () => {
	const nav = navigation( 'processing' );
	act( () =>
		nav.submit( {
			slug: 'processing',
			providedDependencies: {
				processingResult: ProcessingResult.SUCCESS,
				...mockSite,
				goToCheckout: true,
			},
		} as never )
	);
	const checkout = new URL(
		jest.mocked( window.location.replace ).mock.calls[ 0 ][ 0 ] as string,
		'https://wordpress.com'
	);
	const back = new URL( checkout.searchParams.get( 'checkoutBackUrlDomains' )! );
	mockQuery = back.searchParams;
	window.location.pathname = back.pathname;
	sideEffect( 'domains' );

	const steps = await hosting.initialize( {
		dispatch: jest.fn(),
		getState: () => ( {} ),
	} as never );
	expect( mockReset ).not.toHaveBeenCalled();
	expect( mockSeed ).not.toHaveBeenCalled();
	expect( steps ).toContainEqual( expect.objectContaining( { slug: STEPS.UNIFIED_PLANS.slug } ) );
	expect( mockQuery.get( 'siteSlug' ) ).toBe( mockSite.siteSlug );

	const navigate = jest.fn();
	const domainNav = navigation( 'domains', navigate );
	act( () =>
		domainNav.submit( { slug: 'domains', providedDependencies: { domainCart: [] } } as never )
	);
	expect( navigate ).toHaveBeenLastCalledWith( STEPS.UNIFIED_PLANS.slug );
} );

it.each( [
	[ 'without progress', 'domains', undefined ],
	[ 'disabled progress', 'domains', 'false' ],
	[ 'flow root', '', 'true' ],
	[ 'localized flow root', 'fr', 'true' ],
] )( 'resets signup state for %s entries', async ( _entry, step, progress ) => {
	if ( progress === undefined ) {
		mockQuery.delete( 'showPurchaseSteps' );
	} else {
		mockQuery.set( 'showPurchaseSteps', progress );
	}
	await hosting.initialize( { dispatch: jest.fn(), getState: () => ( {} ) } as never );
	sideEffect( step );
	expect( mockReset ).toHaveBeenCalledTimes( 1 );
	expect( mockClear ).toHaveBeenCalledTimes( 1 );
	expect( mockSeed ).toHaveBeenCalledTimes( 1 );
	expect( mockReset.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
		mockSeed.mock.invocationCallOrder[ 0 ]
	);
} );

it( 'does not reset or reseed when moving from the root to another step', () => {
	const { rerender } = sideEffect( '' );
	expect( mockReset ).toHaveBeenCalledTimes( 1 );
	expect( mockSeed ).toHaveBeenCalledTimes( 1 );
	rerender( { stepSlug: 'domains' } );
	rerender( { stepSlug: 'plans' } );
	expect( mockReset ).toHaveBeenCalledTimes( 1 );
	expect( mockSeed ).toHaveBeenCalledTimes( 1 );
} );

it.each( [ true, false ] )(
	'keeps plan and trial initialization with progress=%s',
	async ( enabled ) => {
		mockQuery.set( 'showPurchaseSteps', String( enabled ) );
		for ( const [ trial, eligible, valid, shouldSeed, trialStep ] of [
			[ false, true, true, true, false ],
			[ true, true, true, true, true ],
			[ true, false, true, false, false ],
			[ false, true, false, false, true ],
		] ) {
			jest.clearAllMocks();
			mockTrialPlan = trial;
			mockEligibleForTrial = eligible;
			mockValidPlan = valid;
			const steps = await hosting.initialize( {
				dispatch: mockReduxDispatch,
				getState: () => ( {} ),
			} as never );
			const hook = sideEffect( '' );
			expect( mockReset ).toHaveBeenCalledTimes( 1 );
			expect( mockSeed ).toHaveBeenCalledTimes( shouldSeed ? 1 : 0 );
			expect( steps.some( ( step ) => step.slug === STEPS.TRIAL_ACKNOWLEDGE.slug ) ).toBe(
				trialStep
			);
			hook.unmount();
		}
	}
);

it( 'treats purchase progress without the domain step as a plain visit', async () => {
	mockQuery.delete( 'showDomainStep' );
	const steps = await hosting.initialize( {
		dispatch: jest.fn(),
		getState: () => ( {} ),
	} as never );
	expect( steps ).not.toContainEqual(
		expect.objectContaining( { slug: STEPS.DOMAIN_SEARCH.slug } )
	);
	expect( mockReset ).toHaveBeenCalledTimes( 1 );

	const nav = navigation( 'processing' );
	act( () =>
		nav.submit( {
			slug: 'processing',
			providedDependencies: {
				processingResult: ProcessingResult.SUCCESS,
				...mockSite,
				goToCheckout: true,
			},
		} as never )
	);
	const checkout = new URL(
		jest.mocked( window.location.assign ).mock.calls[ 0 ][ 0 ] as string,
		'https://wordpress.com'
	);
	expect( checkout.searchParams.has( 'showPurchaseSteps' ) ).toBe( false );
} );

it.each( [ ProcessingResult.FAILURE, ProcessingResult.NO_ACTION ] )(
	'routes an agent processing %s to the error step',
	( processingResult ) => {
		mockQuery.set( 'agentHandoffId', 'sbh_0123456789abcdef01234567' );
		const navigate = jest.fn();
		const nav = navigation( 'processing', navigate );
		act( () =>
			nav.submit( {
				slug: 'processing',
				providedDependencies: { processingResult },
			} as never )
		);
		expect( navigate ).toHaveBeenCalledWith( STEPS.ERROR.slug );
		expect( window.location.assign ).not.toHaveBeenCalled();
		expect( window.location.replace ).not.toHaveBeenCalled();
	}
);
