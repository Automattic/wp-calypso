/**
 * @jest-environment jsdom
 */
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { renderHook, act } from '@testing-library/react';
import { setSignupCompleteSiteID, setSignupCompleteSlug } from 'calypso/signup/storageUtils';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import hosting from '../new-hosted-site-flow';
import { resumeCommerceCart } from '../resume-commerce-cart';

jest.mock( '@automattic/onboarding', () => ( {
	NEW_HOSTED_SITE_FLOW: 'new-hosted-site',
	clearStepPersistedState: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-products', () => ( {
	isEcommercePlan: ( plan: string ) => plan.startsWith( 'ecommerce-' ),
	isDotComPlan: () => true,
	isFreeHostingTrial: () => false,
	PLAN_ECOMMERCE_TRIAL_MONTHLY: 'ecommerce-trial-bundle-monthly',
} ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( { ONBOARD_STORE: 'ONBOARD_STORE' } ) );

let mockQuery = new URLSearchParams();
let mockPendingAction: () => Promise< unknown >;
const mockPlan = { product_slug: 'ecommerce-bundle-2y' };
const mockReset = jest.fn();
const mockSeed = jest.fn();
const mockClear = jest.fn();
const mockSite = { siteSlug: 'example.wordpress.com', siteId: '123' };
let mockSavedFlow = NEW_HOSTED_SITE_FLOW;

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: () => unknown ) => unknown ) =>
		callback( () => ( { getPlanCartItem: () => mockPlan, getCouponCode: () => '' } ) ),
	useDispatch: () => ( {
		setDomain: jest.fn(),
		setDomainCartItem: jest.fn(),
		setDomainCartItems: jest.fn(),
		setSiteUrl: jest.fn(),
		setSignupDomainOrigin: jest.fn(),
		setPendingAction: ( action: () => Promise< unknown > ) => {
			mockPendingAction = action;
		},
	} ),
	dispatch: () => ( { resetOnboardStore: mockReset, setPlanCartItem: mockSeed } ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( { useQuery: () => mockQuery } ) );
jest.mock( 'calypso/landing/stepper/utils/get-current-query-params', () => ( {
	getCurrentQueryParams: () => mockQuery,
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-is-valid-woo-partner', () => ( {
	useIsValidWooPartner: () => false,
} ) );
jest.mock( 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial', () => ( {
	isUserEligibleForFreeHostingTrial: () => true,
} ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteSiteID: () => mockSite.siteId,
	getSignupCompleteSlug: () => mockSite.siteSlug,
	getSignupCompleteFlowName: () => mockSavedFlow,
	retrieveSignupDestination: () => '/setup/transferring-hosted-site',
	clearSignupDestinationCookie: () => mockClear(),
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
	setSignupCompleteSiteID: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	persistSignupDestination: jest.fn(),
} ) );
jest.mock( '../resume-commerce-cart', () => ( { resumeCommerceCart: jest.fn() } ) );

beforeEach( () => {
	jest.clearAllMocks();
	mockSavedFlow = NEW_HOSTED_SITE_FLOW;
	mockQuery = new URLSearchParams( {
		plan: mockPlan.product_slug,
		plan_first: 'true',
		showDomainStep: '',
	} );
	Object.defineProperty( window, 'location', {
		value: { ...window.location, assign: jest.fn(), reload: jest.fn() },
		writable: true,
	} );
} );

const navigation = ( step: string, navigate = jest.fn() ) =>
	renderHook( () => hosting.useStepNavigation( step as never, navigate ) ).result.current;

it.each( [
	'ecommerce-bundle',
	'ecommerce-bundle-monthly',
	'ecommerce-bundle-2y',
	'ecommerce-bundle-3y',
] )( 'initializes %s without a plans step', async ( plan ) => {
	mockQuery.set( 'plan', plan );
	const steps = await hosting.initialize( {
		dispatch: jest.fn(),
		getState: () => ( {} ),
	} as never );
	expect( steps.map( ( step ) => step.slug ) ).toContain( STEPS.DOMAIN_SEARCH.slug );
	expect( steps.map( ( step ) => step.slug ) ).not.toContain( STEPS.UNIFIED_PLANS.slug );
	expect( mockSeed ).toHaveBeenCalledWith( expect.objectContaining( { product_slug: plan } ) );
} );

it( 'passes a two-step checkout overview and a term-preserving return URL', () => {
	const replaceState = jest.spyOn( window.history, 'replaceState' ).mockImplementation( () => {} );
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
	expect( checkout.searchParams.get( 'flow' ) ).toBe( NEW_HOSTED_SITE_FLOW );
	expect( checkout.searchParams.get( 'steps_current' ) ).toBe( '2' );
	expect( checkout.searchParams.get( 'steps_total' ) ).toBe( '2' );
	const back = new URL( checkout.searchParams.get( 'checkoutBackUrl' )! );
	expect( back.origin ).toBe( window.location.origin );
	expect( back.pathname ).toBe( '/setup/new-hosted-site/domains' );
	expect( back.searchParams.get( 'plan' ) ).toBe( mockPlan.product_slug );
	expect( back.searchParams.get( 'siteId' ) ).toBe( mockSite.siteId );
	expect( back.searchParams.get( 'siteSlug' ) ).toBe( mockSite.siteSlug );
	expect( back.searchParams.get( 'plan_first' ) ).toBe( 'true' );
	expect( checkout.searchParams.get( 'redirect_to' ) ).toContain(
		'/setup/transferring-hosted-site'
	);
	expect( replaceState ).toHaveBeenCalledWith( window.history.state, '', back.href );
	replaceState.mockRestore();
} );

it( 'keeps other Commerce entries on their existing checkout behavior', () => {
	mockQuery.delete( 'plan_first' );
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
	expect( checkout.searchParams.has( 'flow' ) ).toBe( false );
	expect( checkout.searchParams.has( 'checkoutBackUrl' ) ).toBe( false );
} );

it( 'resumes the same site without running site creation, including after a skipped domain', async () => {
	mockQuery.set( 'siteSlug', mockSite.siteSlug );
	mockQuery.set( 'siteId', mockSite.siteId );
	await hosting.initialize( { dispatch: jest.fn(), getState: () => ( {} ) } as never );
	expect( mockClear ).not.toHaveBeenCalled();
	const navigate = jest.fn();
	const nav = navigation( 'domains', navigate );
	act( () =>
		nav.submit( {
			slug: 'domains',
			providedDependencies: { domainCart: [] },
		} as never )
	);
	expect( navigate ).toHaveBeenCalledWith( STEPS.PROCESSING.slug );
	expect( navigate ).not.toHaveBeenCalledWith( STEPS.SITE_CREATION_STEP.slug );
	await expect( mockPendingAction() ).resolves.toEqual( {
		...mockSite,
		goToCheckout: true,
		siteCreated: true,
	} );
	expect( resumeCommerceCart ).toHaveBeenCalledWith( mockSite.siteSlug, mockPlan, [] );
} );

it( 'retains fallback site identifiers when processing returns only checkout status', () => {
	const replaceState = jest.spyOn( window.history, 'replaceState' ).mockImplementation( () => {} );
	const nav = navigation( 'processing' );
	act( () =>
		nav.submit( {
			slug: 'processing',
			providedDependencies: { processingResult: ProcessingResult.SUCCESS, goToCheckout: true },
		} as never )
	);
	expect( setSignupCompleteSiteID ).toHaveBeenCalledWith( mockSite.siteId );
	expect( setSignupCompleteSlug ).toHaveBeenCalledWith( mockSite.siteSlug );
	expect( jest.mocked( window.location.assign ).mock.calls[ 0 ][ 0 ] ).toContain(
		'/checkout/example.wordpress.com?'
	);
	replaceState.mockRestore();
} );

it( 'remounts cached Commerce pages at the saved return URL', () => {
	renderHook( () => hosting.useSideEffect?.( 'processing', jest.fn() ) );
	window.dispatchEvent( new PageTransitionEvent( 'pageshow', { persisted: true } ) );
	expect( window.location.reload ).toHaveBeenCalledTimes( 1 );
} );

it( 'leaves other cached new-hosted-site consumers unchanged', () => {
	mockQuery.delete( 'plan_first' );
	renderHook( () => hosting.useSideEffect?.( 'processing', jest.fn() ) );
	window.dispatchEvent( new PageTransitionEvent( 'pageshow', { persisted: true } ) );
	expect( window.location.reload ).not.toHaveBeenCalled();
} );
