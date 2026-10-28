/**
 * @jest-environment jsdom
 */
import { fetchShoppingCart, launchSite } from '@automattic/api-core';
import { addProductsToCart, clearStepPersistedState } from '@automattic/onboarding';
import { renderHook } from '@testing-library/react';
import { buildDashboardLink } from 'calypso/dashboard/app/routing';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	clearSignupCompleteFlowName,
	clearSignupCompleteSiteID,
	clearSignupCompleteSlug,
	clearSignupDestinationCookie,
	persistSignupDestination,
} from 'calypso/signup/storageUtils';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import launchSiteFlow from '../launch-site';
import type { BaseNavigationControls } from '../../../internals/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { Store } from 'redux';

let mockQuery: Record< string, string > = {};
let mockOnboard: {
	domainCartItem?: MinimalRequestCartProduct;
	domainCartItems?: MinimalRequestCartProduct[];
	planCartItem?: MinimalRequestCartProduct | null;
	productCartItems?: MinimalRequestCartProduct[] | null;
	signupDomainOrigin?: string;
	siteUrl?: string;
	pendingAction?: () => Promise< unknown >;
	progressTitle?: string;
} = {};
let mockProductsList: Record< string, unknown > = {};
let mockSite: unknown = null;
let mockDomains: unknown[] | Error = [];
let mockCart: unknown = { products: [] };
let mockUserId: number | null = 1;

// Both packages import themselves while loading, so the real exports are read lazily rather than spread.
const lazilyOverride = ( moduleName: string, overrides: Record< string, unknown > ) =>
	new Proxy( overrides, {
		get: ( target, key: string ) =>
			key in target ? target[ key ] : jest.requireActual( moduleName )[ key ],
	} );

jest.mock( '@automattic/onboarding', () =>
	lazilyOverride( '@automattic/onboarding', {
		LAUNCH_SITE_FLOW: 'launch-site',
		addProductsToCart: jest.fn( () => Promise.resolve() ),
		clearStepPersistedState: jest.fn(),
	} )
);

const mockResetOnboardStore = jest.fn();

jest.mock( '@automattic/api-core', () =>
	lazilyOverride( '@automattic/api-core', {
		launchSite: jest.fn( () => Promise.resolve() ),
		fetchShoppingCart: jest.fn( () => Promise.resolve( mockCart ) ),
	} )
);

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( '@wordpress/data', () => {
	const selectors = {
		getDomainCartItem: () => mockOnboard.domainCartItem,
		getDomainCartItems: () => mockOnboard.domainCartItems,
		getPlanCartItem: () => mockOnboard.planCartItem,
		getProductCartItems: () => mockOnboard.productCartItems,
		getSite: () => mockSite,
	};
	const actions = {
		setDomainCartItem: ( item: MinimalRequestCartProduct | undefined ) => {
			mockOnboard.domainCartItem = item;
		},
		setDomainCartItems: ( items: MinimalRequestCartProduct[] ) => {
			mockOnboard.domainCartItems = items;
		},
		setPlanCartItem: ( item: MinimalRequestCartProduct | null ) => {
			mockOnboard.planCartItem = item;
		},
		setProductCartItems: ( items: MinimalRequestCartProduct[] | null ) => {
			mockOnboard.productCartItems = items;
		},
		setSignupDomainOrigin: ( origin: string ) => {
			mockOnboard.signupDomainOrigin = origin;
		},
		setSiteUrl: ( siteUrl: string ) => {
			mockOnboard.siteUrl = siteUrl;
		},
		setPendingAction: ( action: () => Promise< unknown > ) => {
			mockOnboard.pendingAction = action;
		},
		setProgressTitle: ( title: string ) => {
			mockOnboard.progressTitle = title;
		},
		resetOnboardStore: () => mockResetOnboardStore(),
	};

	const overrides: Record< string, unknown > = {
		useSelect: ( mapSelect: ( select: () => typeof selectors ) => unknown ) =>
			mapSelect( () => selectors ),
		useDispatch: () => actions,
		resolveSelect: () => ( {
			getSite: () => Promise.resolve( mockSite ),
			getSiteDomains: () =>
				mockDomains instanceof Error
					? Promise.reject( mockDomains )
					: Promise.resolve( mockDomains ),
		} ),
	};

	return lazilyOverride( '@wordpress/data', overrides );
} );

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) =>
		selector( { productsList: { items: mockProductsList }, currentUser: { id: mockUserId } } ),
} ) );

jest.mock( 'calypso/components/data/query-products-list', () => ( {
	useQueryProductsList: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => ( { get: ( key: string ) => mockQuery[ key ] ?? null } ),
} ) );

jest.mock( 'calypso/landing/stepper/utils/get-current-query-params', () => ( {
	getCurrentQueryParams: () => new URLSearchParams( mockQuery ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	persistSignupDestination: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
} ) );

const ALL_STEPS = [
	STEPS.DOMAIN_SEARCH,
	STEPS.USE_MY_DOMAIN,
	STEPS.UNIFIED_PLANS,
	STEPS.PROCESSING,
	STEPS.ERROR,
];

const domainItem = { product_slug: 'domain_reg', meta: 'example.com' };
const transferItem = { product_slug: 'domain_transfer', meta: 'example.org' };
const mappingItem = { product_slug: 'domain_map', meta: 'example.net' };
const setupUrl = buildDashboardLink( 'dotcom', '/domains/example.net/domain-connection-setup' );
const cartWithMapping = { products: [ { product_slug: 'domain_map', meta: 'example.net' } ] };
const planItem = { product_slug: 'personal-bundle' };
const storageItem = {
	product_slug: 'wordpress_com_1gb_space_addon_yearly',
	quantity: 50,
	volume: 1,
	extra: { feature_slug: 'storage' },
};
const launched = { processingResult: ProcessingResult.SUCCESS };

// The submit handler is typed per step; the tests drive it with whatever each step submits.
const submit = ( currentStep: string, providedDependencies?: unknown, navigate = jest.fn() ) => {
	const { submit: submitStep } = launchSiteFlow.useStepNavigation(
		currentStep as Parameters< typeof launchSiteFlow.useStepNavigation >[ 0 ],
		navigate
	);
	return {
		navigate,
		result: ( submitStep as ( step: unknown ) => unknown )( {
			slug: currentStep,
			providedDependencies,
		} ),
	};
};

// Stepper stores the resolved steps on the flow, although their type mirrors `initialize`'s promise.
const setFlowSteps = ( steps: { slug: string }[] ) => {
	launchSiteFlow.getSteps = ( () => steps ) as unknown as typeof launchSiteFlow.getSteps;
};

type SideEffectStep = Parameters< NonNullable< typeof launchSiteFlow.useSideEffect > >[ 0 ];

const freeSite = { ID: 1, plan: { product_slug: 'free_plan', is_free: true } };
const paidSite = { ID: 1, plan: { product_slug: 'personal-bundle', is_free: false } };
const wpcomDomain = { domain: 'example.wordpress.com', wpcom_domain: true };
const customDomain = { domain: 'example.com', wpcom_domain: false };

const reduxStore = {
	getState: () => ( { currentUser: { id: mockUserId } } ),
} as unknown as Store;

const initializeWith = ( site: unknown, domains: unknown[] | Error ) => {
	mockSite = site;
	mockDomains = domains;
	return launchSiteFlow.initialize( reduxStore );
};

const assigned = () => ( window.location.assign as jest.Mock ).mock.calls[ 0 ]?.[ 0 ];
const replaced = () => ( window.location.replace as jest.Mock ).mock.calls[ 0 ]?.[ 0 ];
const checkoutParam = ( name: string ) =>
	new URL( replaced(), 'http://localhost/' ).searchParams.get( name );
const originalLocation = window.location;

describe( 'launch-site flow', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockQuery = { siteSlug: 'example.wordpress.com' };
		mockUserId = 1;
		mockOnboard = {};
		mockProductsList = {
			domain_reg: {
				product_slug: 'domain_reg',
				is_privacy_protection_product_purchase_allowed: true,
			},
			domain_transfer: {
				product_slug: 'domain_transfer',
				is_privacy_protection_product_purchase_allowed: false,
			},
		};
		Object.defineProperty( window, 'location', {
			value: {
				...window.location,
				href: 'http://localhost/setup/launch-site/domains?siteSlug=example.wordpress.com',
				search: '?siteSlug=example.wordpress.com',
				assign: jest.fn(),
				replace: jest.fn(),
			},
			writable: true,
		} );
		mockSite = null;
		mockDomains = [];
		mockCart = { products: [] };
		setFlowSteps( ALL_STEPS );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
	} );

	describe( 'domains', () => {
		it( 'stores the chosen domains and moves on to plans', () => {
			const { navigate } = submit( STEPS.DOMAIN_SEARCH.slug, {
				domainItem,
				domainCart: [ domainItem ],
				signupDomainOrigin: 'custom',
			} );

			expect( mockOnboard.domainCartItem ).toEqual( domainItem );
			expect( mockOnboard.domainCartItems ).toEqual( [ domainItem ] );
			expect( mockOnboard.signupDomainOrigin ).toBe( 'custom' );
			expect( navigate ).toHaveBeenCalledWith( STEPS.UNIFIED_PLANS.slug );
		} );

		it( 'clears the domains when the user skips', () => {
			mockOnboard.domainCartItem = domainItem;
			mockOnboard.domainCartItems = [ domainItem ];

			const { navigate } = submit( STEPS.DOMAIN_SEARCH.slug, {
				domainItem: undefined,
				domainCart: [],
				signupDomainOrigin: 'choose-later',
			} );

			expect( mockOnboard.domainCartItem ).toBeUndefined();
			expect( mockOnboard.domainCartItems ).toEqual( [] );
			expect( navigate ).toHaveBeenCalledWith( STEPS.UNIFIED_PLANS.slug );
		} );

		it( 'sends the user to connect a domain they own', () => {
			const { navigate } = submit( STEPS.DOMAIN_SEARCH.slug, {
				navigateToUseMyDomain: true,
				lastQuery: 'mine.com',
			} );

			const url = new URL( navigate.mock.calls[ 0 ][ 0 ], 'http://localhost/' );
			expect( url.pathname ).toBe( `/${ STEPS.USE_MY_DOMAIN.slug }` );
			expect( url.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
			expect( url.searchParams.get( 'step' ) ).toBe( 'domain-input' );
			expect( url.searchParams.get( 'initialQuery' ) ).toBe( 'mine.com' );
		} );

		it( 'goes straight to the launch when the site already has a paid plan', () => {
			setFlowSteps( [ STEPS.DOMAIN_SEARCH, STEPS.USE_MY_DOMAIN, STEPS.PROCESSING, STEPS.ERROR ] );

			const { navigate } = submit( STEPS.DOMAIN_SEARCH.slug, { domainCart: [ domainItem ] } );

			expect( mockOnboard.pendingAction ).toBeDefined();
			expect( navigate ).toHaveBeenCalledWith( STEPS.PROCESSING.slug );
		} );
	} );

	describe( 'use my domain', () => {
		it( 'stores the domain to connect or transfer and moves on to plans', () => {
			const { navigate } = submit( STEPS.USE_MY_DOMAIN.slug, { domainCartItem: transferItem } );

			expect( mockOnboard.domainCartItem ).toEqual( transferItem );
			expect( mockOnboard.domainCartItems ).toEqual( [ transferItem ] );
			expect( navigate ).toHaveBeenCalledWith( STEPS.UNIFIED_PLANS.slug );
		} );

		it( 'switches between transfer and connect within the step', () => {
			const { navigate } = submit( STEPS.USE_MY_DOMAIN.slug, {
				mode: 'transfer',
				domain: 'example.com',
			} );

			const url = new URL( navigate.mock.calls[ 0 ][ 0 ], 'http://localhost/' );
			expect( url.pathname ).toBe( `/${ STEPS.USE_MY_DOMAIN.slug }` );
			expect( url.searchParams.get( 'step' ) ).toBe( 'transfer' );
			expect( url.searchParams.get( 'initialQuery' ) ).toBe( 'example.com' );
			expect( mockOnboard.domainCartItems ).toBeUndefined();
		} );

		it( 'drops a domain picked earlier when the domain to connect needs a plan first', () => {
			mockOnboard.domainCartItem = domainItem;
			mockOnboard.domainCartItems = [ domainItem ];

			const { navigate } = submit( STEPS.USE_MY_DOMAIN.slug, { skipToPlan: true } );

			expect( mockOnboard.domainCartItem ).toBeUndefined();
			expect( mockOnboard.domainCartItems ).toEqual( [] );
			expect( navigate ).toHaveBeenCalledWith( STEPS.UNIFIED_PLANS.slug );
		} );
	} );

	describe( 'back', () => {
		const goBack = ( currentStep: string, search: string ) => {
			window.location.href = `http://localhost/setup/launch-site/${ currentStep }?siteSlug=example.wordpress.com${ search }`;
			const navigate = jest.fn();
			const { goBack: goBackStep } = launchSiteFlow.useStepNavigation(
				currentStep as Parameters< typeof launchSiteFlow.useStepNavigation >[ 0 ],
				navigate
			) as ReturnType< typeof launchSiteFlow.useStepNavigation > & BaseNavigationControls;
			goBackStep?.();
			return navigate;
		};

		it( 'returns from transfer-or-connect to the domain input', () => {
			const navigate = goBack(
				STEPS.USE_MY_DOMAIN.slug,
				'&step=transfer-or-connect&initialQuery=example.com'
			);

			expect( navigate ).toHaveBeenCalledWith( `${ STEPS.USE_MY_DOMAIN.slug }?step=domain-input` );
		} );

		it.each( [ 'transfer-domain', 'ownership-verification' ] )(
			'returns from %s to transfer-or-connect',
			( mode ) => {
				const navigate = goBack( STEPS.USE_MY_DOMAIN.slug, `&step=${ mode }` );

				expect( navigate ).toHaveBeenCalledWith(
					`${ STEPS.USE_MY_DOMAIN.slug }?step=transfer-or-connect`
				);
			}
		);

		it( 'returns from the domain input to the domain search', () => {
			const navigate = goBack( STEPS.USE_MY_DOMAIN.slug, '&step=domain-input' );

			expect( navigate ).toHaveBeenCalledWith( STEPS.DOMAIN_SEARCH.slug );
		} );

		it( 'returns from plans to the domain search', () => {
			const navigate = goBack( STEPS.UNIFIED_PLANS.slug, '' );

			expect( navigate ).toHaveBeenCalledWith( STEPS.DOMAIN_SEARCH.slug );
		} );
	} );

	describe( 'plans', () => {
		it( 'stores the chosen plan and launches the site', () => {
			const { navigate } = submit( STEPS.UNIFIED_PLANS.slug, {
				stepName: 'plans',
				cartItems: [ planItem ],
			} );

			expect( mockOnboard.planCartItem ).toEqual( planItem );
			expect( mockOnboard.productCartItems ).toEqual( [] );
			expect( mockOnboard.pendingAction ).toBeDefined();
			expect( mockOnboard.progressTitle ).toBe( 'Your site will be live shortly.' );
			expect( navigate ).toHaveBeenCalledWith( STEPS.PROCESSING.slug );
		} );

		it( 'stores a storage add-on picked with the plan', () => {
			submit( STEPS.UNIFIED_PLANS.slug, {
				stepName: 'plans',
				cartItems: [ planItem, storageItem ],
			} );

			expect( mockOnboard.planCartItem ).toEqual( planItem );
			expect( mockOnboard.productCartItems ).toEqual( [ storageItem ] );
		} );

		it( 'clears the plan when the user keeps the one they have', () => {
			mockOnboard.planCartItem = planItem;
			mockOnboard.productCartItems = [ storageItem ];

			const { navigate } = submit( STEPS.UNIFIED_PLANS.slug, {
				stepName: 'plans',
				cartItems: null,
			} );

			expect( mockOnboard.planCartItem ).toBeNull();
			expect( mockOnboard.productCartItems ).toEqual( [] );
			expect( navigate ).toHaveBeenCalledWith( STEPS.PROCESSING.slug );
		} );

		it( 'passes the launch page props, keeping the free plan', () => {
			const props = launchSiteFlow.useStepsProps?.()[ STEPS.UNIFIED_PLANS.slug ];

			expect( props ).toMatchObject( {
				isInSignup: true,
				isLaunchPage: true,
				isCustomDomainAllowedOnFreePlan: true,
				deemphasizeFreePlan: true,
			} );
			expect( props ).not.toHaveProperty( 'hideFreePlan' );
			expect( props?.wrapperProps?.goBack ).toBeUndefined();
		} );

		it( 'returns to where the user came from on Back when plans is the first step', () => {
			setFlowSteps( [ STEPS.UNIFIED_PLANS, STEPS.PROCESSING, STEPS.ERROR ] );
			mockQuery.back_to = '/sites';

			launchSiteFlow.useStepsProps?.()[ STEPS.UNIFIED_PLANS.slug ]?.wrapperProps?.goBack?.();

			expect( assigned() ).toBe( '/sites' );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'launch', () => {
		it( 'launches the site in the processing step', async () => {
			mockSite = freeSite;
			submit( STEPS.UNIFIED_PLANS.slug, { cartItems: null } );

			await expect( mockOnboard.pendingAction?.() ).resolves.toEqual( {
				siteSlug: 'example.wordpress.com',
			} );
			expect( launchSite ).toHaveBeenCalledWith( 1 );
		} );

		it( 'lets the processing step see a failed launch', async () => {
			mockSite = freeSite;
			( launchSite as jest.Mock ).mockRejectedValueOnce( new Error( 'launch failed' ) );
			submit( STEPS.UNIFIED_PLANS.slug, { cartItems: null } );

			await expect( mockOnboard.pendingAction?.() ).rejects.toThrow( 'launch failed' );
		} );

		it( 'shows the error step when the launch fails', () => {
			const { navigate } = submit( STEPS.PROCESSING.slug, {
				processingResult: ProcessingResult.FAILURE,
			} );

			expect( navigate ).toHaveBeenCalledWith( STEPS.ERROR.slug );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );

		it( 'starts the launch when the flow begins at processing', () => {
			const { navigate } = submit( STEPS.PROCESSING.slug, {
				processingResult: ProcessingResult.NO_ACTION,
			} );

			expect( mockOnboard.pendingAction ).toBeDefined();
			expect( navigate ).toHaveBeenCalledWith( STEPS.PROCESSING.slug );
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );

		it( 'lands on the destination when there is nothing to buy', async () => {
			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( window.location.assign ).not.toHaveBeenCalled();
			expect( addProductsToCart ).not.toHaveBeenCalled();
			expect( replaced() ).toBe( '/home/example.wordpress.com?celebrateLaunch=true' );
		} );

		it( 'lands on redirect_to when there is nothing to buy', async () => {
			mockQuery.redirect_to = '/plugins/example.wordpress.com';
			mockQuery.back_to = '/sites';

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( replaced() ).toBe( '/plugins/example.wordpress.com?celebrateLaunch=true' );
		} );

		it( 'adds the domain and plan to the cart, then goes to checkout', async () => {
			mockOnboard.domainCartItems = [ domainItem ];
			mockOnboard.planCartItem = planItem;
			mockQuery.redirect_to = '/plugins/example.wordpress.com';

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'launch-site', [
				{ ...domainItem, extra: { privacy: true } },
				planItem,
			] );

			const url = new URL( replaced(), 'http://localhost/' );
			expect( url.pathname ).toBe( '/checkout/example.wordpress.com' );
			expect( url.searchParams.get( 'redirect_to' ) ).toBe(
				'/plugins/example.wordpress.com?celebrateLaunch=true'
			);
			expect( url.searchParams.get( 'checkoutBackUrl' ) ).toContain( 'skippedCheckout=1' );
			expect( persistSignupDestination ).toHaveBeenCalledWith(
				'/plugins/example.wordpress.com?celebrateLaunch=true'
			);
		} );

		it( 'adds a storage add-on picked with the plan to the cart', async () => {
			mockOnboard.planCartItem = planItem;
			mockOnboard.productCartItems = [ storageItem ];

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'launch-site', [
				planItem,
				storageItem,
			] );
		} );

		it( 'keeps the chosen domain through a refresh, which only persists the single item', async () => {
			mockOnboard.domainCartItem = domainItem;

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'launch-site', [
				{ ...domainItem, extra: { privacy: true } },
			] );
		} );

		it( 'still goes to checkout when the cart cannot be updated', async () => {
			mockOnboard.planCartItem = planItem;
			( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'no cart key' ) );

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( new URL( replaced(), 'http://localhost/' ).pathname ).toBe(
				'/checkout/example.wordpress.com'
			);
		} );

		it( 'ignores a plan and domain saved by another flow when this one skips those steps', async () => {
			setFlowSteps( [ STEPS.PROCESSING, STEPS.ERROR ] );
			mockOnboard.domainCartItems = [ domainItem ];
			mockOnboard.planCartItem = planItem;

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( addProductsToCart ).not.toHaveBeenCalled();
			expect( replaced() ).toBe( '/home/example.wordpress.com?celebrateLaunch=true' );
		} );

		it( 'ignores a saved plan when this flow skips the plan step', async () => {
			setFlowSteps( [ STEPS.DOMAIN_SEARCH, STEPS.USE_MY_DOMAIN, STEPS.PROCESSING, STEPS.ERROR ] );
			mockOnboard.domainCartItems = [ domainItem ];
			mockOnboard.planCartItem = planItem;
			mockOnboard.productCartItems = [ storageItem ];

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'launch-site', [
				{ ...domainItem, extra: { privacy: true } },
			] );
		} );

		it( 'never lands on another host through a redirect_to that only looks like a path', async () => {
			mockQuery.redirect_to = '/..//evil.example';

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( replaced() ).toBe( '/home/example.wordpress.com?celebrateLaunch=true' );
		} );

		it( 'only adds privacy to the products that support it', async () => {
			mockOnboard.domainCartItems = [ transferItem ];

			await submit( STEPS.PROCESSING.slug, launched ).result;

			expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'launch-site', [
				transferItem,
			] );
		} );

		it( 'waits for the cart before going to checkout', async () => {
			mockOnboard.planCartItem = planItem;
			let finishAdding = () => {};
			( addProductsToCart as jest.Mock ).mockImplementationOnce(
				() => new Promise< void >( ( resolve ) => ( finishAdding = resolve ) )
			);

			const { result } = submit( STEPS.PROCESSING.slug, launched );

			expect( window.location.replace ).not.toHaveBeenCalled();
			finishAdding();
			await result;
			expect( window.location.replace ).toHaveBeenCalled();
		} );

		describe( 'connecting a domain', () => {
			const launchDestination = '/home/example.wordpress.com?celebrateLaunch=true';

			beforeEach( () => {
				mockSite = paidSite;
				mockCart = cartWithMapping;
				mockOnboard.domainCartItems = [ mappingItem ];
			} );

			it( 'lands on the connection setup after checkout', async () => {
				mockQuery.redirect_to = '/plugins/example.wordpress.com';

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( fetchShoppingCart ).toHaveBeenCalledWith( paidSite.ID );
				expect( new URL( replaced(), 'http://localhost/' ).pathname ).toBe(
					'/checkout/example.wordpress.com'
				);
				expect( checkoutParam( 'redirect_to' ) ).toBe( setupUrl );
				expect( checkoutParam( 'checkoutBackUrl' ) ).toContain( '/plugins/example.wordpress.com' );
			} );

			it( 'leaves no cookie behind for a later checkout to land on', async () => {
				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( persistSignupDestination ).not.toHaveBeenCalled();
				expect( clearSignupDestinationCookie ).toHaveBeenCalled();
			} );

			it( 'lands on the dotcom Dashboard connection setup for a launch from A4A', async () => {
				mockQuery.dashboard = 'a4a';
				window.location.search = '?dashboard=a4a';

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( checkoutParam( 'redirect_to' ) ).toBe( setupUrl );
			} );

			it( 'finds the connection in the cart whatever the case it was typed in', async () => {
				mockOnboard.domainCartItems = [ { ...mappingItem, meta: 'Example.NET' } ];

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( checkoutParam( 'redirect_to' ) ).toBe( setupUrl );
			} );

			it( 'still lands on the connection setup when a plan is bought with it', async () => {
				mockOnboard.planCartItem = planItem;
				mockCart = { products: [ ...cartWithMapping.products, planItem ] };

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( addProductsToCart ).toHaveBeenCalledWith( 'example.wordpress.com', 'launch-site', [
					mappingItem,
					planItem,
				] );
				expect( checkoutParam( 'redirect_to' ) ).toBe( setupUrl );
			} );

			it( 'keeps the launch destination when another domain is bought alongside', async () => {
				mockOnboard.domainCartItems = [ mappingItem, domainItem ];
				mockCart = { products: [ ...cartWithMapping.products, domainItem ] };

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( fetchShoppingCart ).not.toHaveBeenCalled();
				expect( checkoutParam( 'redirect_to' ) ).toBe( launchDestination );
				expect( checkoutParam( 'checkoutBackUrl' ) ).toContain( launchDestination );
			} );

			it( 'keeps the launch destination when the connection did not make it into the cart', async () => {
				mockCart = { products: [] };

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( checkoutParam( 'redirect_to' ) ).toBe( launchDestination );
				expect( persistSignupDestination ).toHaveBeenCalledWith( launchDestination );
				expect( clearSignupDestinationCookie ).not.toHaveBeenCalled();
			} );

			it( 'keeps the launch destination when adding to the cart fails', async () => {
				mockCart = { products: [] };
				( addProductsToCart as jest.Mock ).mockRejectedValueOnce( new Error( 'no cart key' ) );

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( checkoutParam( 'redirect_to' ) ).toBe( launchDestination );
			} );

			it( 'keeps the launch destination, without asking again, when the cart answers with an error', async () => {
				( fetchShoppingCart as jest.Mock ).mockRejectedValueOnce( new Error( 'offline' ) );

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( fetchShoppingCart ).toHaveBeenCalledTimes( 1 );
				expect( checkoutParam( 'redirect_to' ) ).toBe( launchDestination );
			} );

			describe( 'when the cart does not answer', () => {
				const unanswered = () => new Promise( () => {} );

				beforeEach( () => {
					jest.useFakeTimers();
				} );

				afterEach( () => {
					jest.useRealTimers();
				} );

				it( 'asks again and lands on the connection setup once it answers', async () => {
					( fetchShoppingCart as jest.Mock ).mockReturnValueOnce( unanswered() );

					const { result } = submit( STEPS.PROCESSING.slug, launched );
					await jest.advanceTimersByTimeAsync( 1000 );
					await result;

					expect( fetchShoppingCart ).toHaveBeenCalledTimes( 2 );
					expect( checkoutParam( 'redirect_to' ) ).toBe( setupUrl );
				} );

				it( 'keeps the launch destination after three silent attempts', async () => {
					( fetchShoppingCart as jest.Mock )
						.mockReturnValueOnce( unanswered() )
						.mockReturnValueOnce( unanswered() )
						.mockReturnValueOnce( unanswered() );

					const { result } = submit( STEPS.PROCESSING.slug, launched );
					await jest.advanceTimersByTimeAsync( 3000 );
					await result;

					expect( fetchShoppingCart ).toHaveBeenCalledTimes( 3 );
					expect( checkoutParam( 'redirect_to' ) ).toBe( launchDestination );
				} );
			} );

			it( 'does not read the cart when only registering a domain', async () => {
				mockOnboard.domainCartItems = [ domainItem ];

				await submit( STEPS.PROCESSING.slug, launched ).result;

				expect( fetchShoppingCart ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'entering the flow', () => {
		it( 'starts from a clean slate at the flow root', () => {
			renderHook( () =>
				launchSiteFlow.useSideEffect?.( undefined as unknown as SideEffectStep, jest.fn() )
			);

			expect( mockResetOnboardStore ).toHaveBeenCalled();
			expect( clearStepPersistedState ).toHaveBeenCalledWith( 'launch-site' );
			expect( clearSignupDestinationCookie ).toHaveBeenCalled();
			expect( clearSignupCompleteFlowName ).toHaveBeenCalled();
			expect( clearSignupCompleteSlug ).toHaveBeenCalled();
			expect( clearSignupCompleteSiteID ).toHaveBeenCalled();
		} );

		it( 'keeps the selections on a later step', () => {
			renderHook( () => launchSiteFlow.useSideEffect?.( STEPS.UNIFIED_PLANS.slug, jest.fn() ) );

			expect( mockResetOnboardStore ).not.toHaveBeenCalled();
			expect( clearStepPersistedState ).not.toHaveBeenCalled();
			expect( clearSignupDestinationCookie ).not.toHaveBeenCalled();
			expect( clearSignupCompleteSlug ).not.toHaveBeenCalled();
		} );

		it( "gives the plans step the site's own address", () => {
			mockQuery = { siteSlug: 'launchcompare4murdmici.wordpress.com' };
			mockSite = { ...freeSite, URL: 'https://launchcompare4murdmici.wordpress.com' };
			mockOnboard = { domainCartItem: { product_slug: 'domain_reg', meta: 'launchcompare4.blog' } };

			renderHook( () => launchSiteFlow.useSideEffect?.( STEPS.DOMAIN_SEARCH.slug, jest.fn() ) );

			expect( mockOnboard.siteUrl ).toBe( 'launchcompare4murdmici.wordpress.com' );
		} );

		it( 'gives the plans step the site address when it is the first step, as after a refresh', () => {
			mockQuery = { siteSlug: 'example.wordpress.com' };
			mockSite = undefined;

			renderHook( () => launchSiteFlow.useSideEffect?.( STEPS.UNIFIED_PLANS.slug, jest.fn() ) );

			expect( mockOnboard.siteUrl ).toBe( 'example.wordpress.com' );
		} );

		it( 'leaves the site address unset at the flow root, which resets the store', () => {
			mockSite = { ...freeSite, URL: 'https://example.wordpress.com' };

			renderHook( () =>
				launchSiteFlow.useSideEffect?.( undefined as unknown as SideEffectStep, jest.fn() )
			);

			expect( mockOnboard.siteUrl ).toBeUndefined();
		} );
	} );

	describe( 'login', () => {
		it( 'sends logged-out users to the log-in page', () => {
			expect( launchSiteFlow.__experimentalUseBuiltinAuth ).toBe( false );
			expect( launchSiteFlow.useLoginParams?.() ).toEqual( { customLoginPath: '/log-in' } );
		} );
	} );

	describe( 'initialize', () => {
		it( 'asks a logged-out user to log in, without looking the site up', async () => {
			mockUserId = null;
			mockSite = paidSite;
			mockDomains = [ customDomain ];

			const steps = await launchSiteFlow.initialize( reduxStore );

			expect( steps && steps.map( ( step ) => step.slug ) ).toEqual(
				ALL_STEPS.map( ( step ) => step.slug )
			);
			expect(
				steps &&
					steps.every( ( step ) => 'requiresLoggedInUser' in step && step.requiresLoggedInUser )
			).toBe( true );
			expect( window.location.replace ).not.toHaveBeenCalled();
			expect( window.location.assign ).not.toHaveBeenCalled();
			expect( recordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'leaves for the sites list without a site', async () => {
			mockQuery = {};

			expect( await launchSiteFlow.initialize( reduxStore ) ).toBe( false );
			expect( replaced() ).toBe( '/sites' );
		} );

		it( 'leaves for the sites list when the site cannot be found', async () => {
			expect( await launchSiteFlow.initialize( reduxStore ) ).toBe( false );
			expect( replaced() ).toBe( '/sites' );
		} );

		it( 'asks for everything on a free site without a custom domain', async () => {
			const steps = await initializeWith( freeSite, [ wpcomDomain ] );

			expect( steps && steps.map( ( step ) => step.slug ) ).toEqual(
				ALL_STEPS.map( ( step ) => step.slug )
			);
			expect( recordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'keeps the domain step when the domains cannot be loaded', async () => {
			const steps = await initializeWith( freeSite, new Error( 'domains failed' ) );

			expect( steps && steps.map( ( step ) => step.slug ) ).toEqual(
				ALL_STEPS.map( ( step ) => step.slug )
			);
		} );

		it( 'skips the steps the site has no use for, and records it', async () => {
			const steps = await initializeWith( paidSite, [ wpcomDomain, customDomain ] );

			expect( steps && steps.map( ( step ) => step.slug ) ).toEqual( [
				STEPS.PROCESSING.slug,
				STEPS.ERROR.slug,
			] );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_actions_exclude_step', {
				flow: 'launch-site',
				step: 'domains-launch',
				value: 'example.com',
			} );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_signup_actions_exclude_step', {
				flow: 'launch-site',
				step: 'plans-launch',
				value: 'personal-bundle',
			} );
		} );
	} );
} );
