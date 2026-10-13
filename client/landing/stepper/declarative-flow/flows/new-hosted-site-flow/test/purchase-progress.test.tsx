/**
 * @jest-environment jsdom
 */
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { renderHook, act } from '@testing-library/react';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import hosting from '../new-hosted-site-flow';

jest.mock( '@automattic/onboarding', () => ( {
	NEW_HOSTED_SITE_FLOW: 'new-hosted-site',
	clearStepPersistedState: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-products', () => ( {
	isDotComPlan: () => true,
	isFreeHostingTrial: () => false,
} ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( { ONBOARD_STORE: 'ONBOARD_STORE' } ) );

let mockQuery = new URLSearchParams();
let mockLocale = 'en';
const mockPlan = { product_slug: 'ecommerce-bundle-2y' };
const mockReset = jest.fn();
const mockSeed = jest.fn();
const mockClear = jest.fn();
const mockSite = { siteSlug: 'example.wordpress.com', siteId: '123' };
let mockSavedFlow = NEW_HOSTED_SITE_FLOW;
let mockCheckoutUnloaded = false;

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
	isUserEligibleForFreeHostingTrial: () => true,
} ) );
jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteSiteID: () => mockSite.siteId,
	getSignupCompleteSlug: () => mockSite.siteSlug,
	getSignupCompleteFlowName: () => mockSavedFlow,
	wasSignupCheckoutPageUnloaded: () => mockCheckoutUnloaded,
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

beforeEach( () => {
	jest.clearAllMocks();
	mockLocale = 'en';
	mockCheckoutUnloaded = false;
	mockSavedFlow = NEW_HOSTED_SITE_FLOW;
	mockQuery = new URLSearchParams( {
		plan: mockPlan.product_slug,
		showPurchaseSteps: 'true',
		showDomainStep: '',
	} );
	Object.defineProperty( window, 'location', {
		value: { ...window.location, assign: jest.fn(), replace: jest.fn() },
		writable: true,
	} );
} );

const navigation = ( step: string, navigate = jest.fn() ) =>
	renderHook( () => hosting.useStepNavigation( step as never, navigate ) ).result.current;

it.each( [ 'en', 'fr' ] )( 'passes checkout steps and a domain return URL in %s', ( locale ) => {
	mockLocale = locale;
	mockQuery.set( 'plan', 'ecommerce-bundle' );
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
	expect( checkout.searchParams.get( 'flow' ) ).toBe( NEW_HOSTED_SITE_FLOW );
	expect( checkout.searchParams.get( 'steps_current' ) ).toBe( '2' );
	expect( checkout.searchParams.get( 'steps_total' ) ).toBe( '2' );
	const back = new URL( checkout.searchParams.get( 'checkoutBackUrl' )! );
	expect( back.origin ).toBe( window.location.origin );
	expect( back.pathname ).toBe( `/setup/new-hosted-site/domains${ locale === 'en' ? '' : '/fr' }` );
	expect( back.searchParams.get( 'plan' ) ).toBe( mockPlan.product_slug );
	expect( back.searchParams.get( 'showPurchaseSteps' ) ).toBe( 'true' );
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
	expect( checkout.searchParams.has( 'flow' ) ).toBe( false );
	expect( checkout.searchParams.has( 'checkoutBackUrl' ) ).toBe( false );
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

it( 'preserves signup state for the shared checkout-return path', async () => {
	mockCheckoutUnloaded = true;
	await hosting.initialize( { dispatch: jest.fn(), getState: () => ( {} ) } as never );
	expect( mockReset ).not.toHaveBeenCalled();
	expect( mockClear ).not.toHaveBeenCalled();
} );

it.each( [ 'fresh', 'other-flow', 'without-progress' ] )(
	'resets signup state for %s visits',
	async ( entry ) => {
		mockCheckoutUnloaded = entry !== 'fresh';
		if ( entry === 'other-flow' ) {
			mockSavedFlow = 'onboarding';
		}
		if ( entry === 'without-progress' ) {
			mockQuery.delete( 'showPurchaseSteps' );
		}
		await hosting.initialize( { dispatch: jest.fn(), getState: () => ( {} ) } as never );
		expect( mockReset ).toHaveBeenCalled();
		expect( mockClear ).toHaveBeenCalled();
	}
);
